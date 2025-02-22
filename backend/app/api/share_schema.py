from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

# User related schemas
class UserBase(BaseModel):
    email: EmailStr
    username: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    is_active: bool = True
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Detection related schemas
class Detection(BaseModel):
    class_name: str
    confidence: float
    bbox: List[float]

class DetectionResponse(BaseModel):
    id: int
    has_fire: bool
    confidence_score: float
    detections: List[Detection]
    message: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Detection Log schema
class DetectionLog(BaseModel):
    id: int
    user_id: int
    source_type: str  # "camera" or "upload"
    has_fire: bool
    confidence_score: float
    detections: List[Detection]
    created_at: datetime
    image_path: Optional[str] = None

    class Config:
        from_attributes = True
