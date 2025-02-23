from sqlalchemy import Column, String, Boolean, Float, JSON, DateTime
from app.db.database import Base

class DetectionLog(Base):
    __tablename__ = "detection_logs"

    id = Column(String, primary_key=True)
    message = Column(String)
    has_fire = Column(Boolean, default=False)
    confidence_score = Column(Float)  # Make sure this column exists
    file_name = Column(String, nullable=True)
    detections = Column(JSON)
    result_image = Column(String, nullable=True)
    date = Column(String)
