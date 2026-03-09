from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List, Dict

class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None

class ProjectResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class AnalysisRequest(BaseModel):
    mode: str  # "fast" or "high_accuracy"

class AnalysisResponse(BaseModel):
    id: int
    project_id: int
    mode: str
    drift_score: float
    drifted_features: List[str]
    report: Dict
    created_at: datetime

    class Config:
        from_attributes = True
