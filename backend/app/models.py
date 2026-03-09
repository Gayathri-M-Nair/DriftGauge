from sqlalchemy import Column, Integer, String, DateTime, Text, Float
from datetime import datetime
from .database import Base

class Project(Base):
    __tablename__ = "projects"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Analysis(Base):
    __tablename__ = "analyses"
    
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, index=True)
    mode = Column(String)  # "fast" or "high_accuracy"
    drift_score = Column(Float)
    drifted_features = Column(Text)  # JSON string
    report = Column(Text)  # JSON string
    created_at = Column(DateTime, default=datetime.utcnow)
