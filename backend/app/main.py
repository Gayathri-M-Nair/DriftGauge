from fastapi import FastAPI, Depends, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import pandas as pd
import json
import os
from pathlib import Path

from .database import engine, get_db, Base
from . import models, schemas
from .drift_engine import DriftDetector

Base.metadata.create_all(bind=engine)

app = FastAPI(title="DriftGauge API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

@app.post("/projects", response_model=schemas.ProjectResponse)
def create_project(project: schemas.ProjectCreate, db: Session = Depends(get_db)):
    db_project = models.Project(name=project.name, description=project.description)
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

@app.get("/projects", response_model=list[schemas.ProjectResponse])
def list_projects(db: Session = Depends(get_db)):
    return db.query(models.Project).all()

@app.post("/projects/{project_id}/upload-baseline")
async def upload_baseline(project_id: int, file: UploadFile = File(...)):
    project_dir = UPLOAD_DIR / str(project_id)
    project_dir.mkdir(exist_ok=True)
    
    file_path = project_dir / "baseline.csv"
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)
    
    return {"message": "Baseline dataset uploaded"}

@app.post("/projects/{project_id}/upload-current")
async def upload_current(project_id: int, file: UploadFile = File(...)):
    project_dir = UPLOAD_DIR / str(project_id)
    project_dir.mkdir(exist_ok=True)
    
    file_path = project_dir / "current.csv"
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)
    
    return {"message": "Current dataset uploaded"}

@app.post("/projects/{project_id}/analyze", response_model=schemas.AnalysisResponse)
def analyze_drift(project_id: int, request: schemas.AnalysisRequest, db: Session = Depends(get_db)):
    baseline_path = UPLOAD_DIR / str(project_id) / "baseline.csv"
    current_path = UPLOAD_DIR / str(project_id) / "current.csv"
    
    if not baseline_path.exists() or not current_path.exists():
        raise HTTPException(status_code=400, detail="Both datasets must be uploaded")
    
    baseline_df = pd.read_csv(baseline_path)
    current_df = pd.read_csv(current_path)
    
    detector = DriftDetector()
    result = detector.detect_drift(baseline_df, current_df, mode=request.mode)
    
    analysis = models.Analysis(
        project_id=project_id,
        mode=request.mode,
        drift_score=result["drift_score"],
        drifted_features=json.dumps(result["drifted_features"]),
        report=json.dumps(result)
    )
    db.add(analysis)
    db.commit()
    db.refresh(analysis)
    
    return schemas.AnalysisResponse(
        id=analysis.id,
        project_id=analysis.project_id,
        mode=analysis.mode,
        drift_score=analysis.drift_score,
        drifted_features=result["drifted_features"],
        report=result,
        created_at=analysis.created_at
    )

@app.get("/projects/{project_id}/analyses")
def get_analyses(project_id: int, db: Session = Depends(get_db)):
    analyses = db.query(models.Analysis).filter(models.Analysis.project_id == project_id).all()
    return [
        schemas.AnalysisResponse(
            id=a.id,
            project_id=a.project_id,
            mode=a.mode,
            drift_score=a.drift_score,
            drifted_features=json.loads(a.drifted_features),
            report=json.loads(a.report),
            created_at=a.created_at
        ) for a in analyses
    ]

@app.get("/analysis/{analysis_id}", response_model=schemas.AnalysisResponse)
def get_analysis_by_id(analysis_id: int, db: Session = Depends(get_db)):
    """Get a specific analysis by its ID"""
    analysis = db.query(models.Analysis).filter(models.Analysis.id == analysis_id).first()
    
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    return schemas.AnalysisResponse(
        id=analysis.id,
        project_id=analysis.project_id,
        mode=analysis.mode,
        drift_score=analysis.drift_score,
        drifted_features=json.loads(analysis.drifted_features),
        report=json.loads(analysis.report),
        created_at=analysis.created_at
    )
