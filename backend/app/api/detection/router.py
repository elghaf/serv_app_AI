from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.api.share_schema import DetectionResponse
from app.utils.auth import get_current_user
from ultralytics import YOLO
import numpy as np
import cv2
from datetime import datetime
import pytz
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

# Initialize YOLO model
try:
    model = YOLO("app/assets/best.pt")
    logger.info("YOLO model loaded successfully")
except Exception as e:
    logger.error(f"Failed to load YOLO model: {str(e)}")

@router.post("/detect/stream", response_model=DetectionResponse)
async def detect_stream(
    frame: UploadFile = File(...),
    user_id: int = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Read frame
    contents = await frame.read()
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    # Perform YOLO detection
    results = model(img)
    result = results[0]
    
    # Process detections
    detections = []
    has_fire = False
    confidence_score = 0.0
    
    for box in result.boxes:
        class_name = model.names[int(box.cls)]
        confidence = float(box.conf)
        bbox = box.xyxy[0].tolist()
        
        detections.append({
            "class_name": class_name,
            "confidence": confidence,
            "bbox": bbox
        })
        
        if class_name == "fire":
            has_fire = True
            confidence_score = max(confidence_score, confidence)
    
    # Create detection log
    detection_log = DetectionLog(
        user_id=user_id,
        source_type="camera",
        detections=detections,
        confidence_score=confidence_score,
        has_fire=has_fire,
        created_at=datetime.now(pytz.UTC)
    )
    db.add(detection_log)
    db.commit()
    
    return DetectionResponse(
        id=detection_log.id,
        has_fire=has_fire,
        confidence_score=confidence_score,
        detections=detections,
        message="Detection completed"
    )

@router.post("/detect/upload", response_model=DetectionResponse)
async def detect_upload(
    video: UploadFile = File(...),
    user_id: int = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Similar implementation for uploaded videos
    pass

@router.get("/health")
async def health_check():
    try:
        # Check if YOLO model is loaded
        if model:
            return {"status": "healthy", "model_loaded": True}
        return {"status": "degraded", "model_loaded": False}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
