from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class Detection(BaseModel):
    class_name: str
    confidence: float
    bbox: List[float]

class DetectionResponse(BaseModel):
    id: str  # Keep as string since you're using UUID
    message: str
    has_fire: bool
    confidence_score: float
    file_name: Optional[str] = None
    detections: List[Detection] = []  # Use the Detection model instead of dict
    result_image: Optional[str] = None
    date: str 
