from sqlalchemy.orm import Session
from app.db.models.detection_log import DetectionLog
from app.models.detection import DetectionResponse


def create_detection_log(db: Session, detection_data: dict):
    detections_list = [
        {
            "class_name": d["class_name"],
            "confidence": d["confidence"],
            "bbox": d["bbox"]
        }
        for d in detection_data["detections"]
    ]
    
    db_log = DetectionLog(
        id=detection_data["id"],  # Use the string UUID
        file_name=detection_data["file_name"],
        result_image=detection_data["result_image"],
        detections=detections_list,
        message=detection_data["message"],
        has_fire=detection_data["has_fire"],
        confidence_score=detection_data["confidence_score"],
        date=detection_data["date"]
    )
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log
