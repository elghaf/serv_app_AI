import uuid
from fastapi import APIRouter, HTTPException, File, UploadFile, Depends
from app.api.predict_metal.schema import Detection, PredictMetalSchema
from sqlalchemy.orm import Session
from app.db.database import get_db
from datetime import datetime
from ultralytics import YOLO
import logging
import shutil
import os
import pytz

import cv2
from app.utils.auth import get_current_user
from app.db.models.user import User

router = APIRouter()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png"}

def allowed_file(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

def generate_random_file_name(filename: str) -> str:
    _, file_extension = os.path.splitext(filename)
    random_file_name = f"{uuid.uuid4()}{file_extension}"
    return random_file_name

@router.post("/predict_metal", response_model=PredictMetalSchema)
async def predict_metal(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    logger.info(f"Received file: {file.filename}")

    if not allowed_file(file.filename):
        raise HTTPException(
            status_code=422,
            detail="Unsupported file format. Only jpg, jpeg or png are allowed.",
        )

    new_file_name = generate_random_file_name(file.filename)
    temp_dir = "temp"
    os.makedirs(temp_dir, exist_ok=True)
    temp_file_path = os.path.join(temp_dir, new_file_name)

    try:
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except IOError as e:
        logger.error(f"Error occurred while saving file: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to save file.")

    try:
        # Load your trained metal classification model
        model = YOLO("app/assets/metal_classifier.pt")
        logger.info("Model loaded successfully.")
    except Exception as e:
        logger.error(f"Error occurred while loading model: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to load model.")

    try:
        results = model(temp_file_path)
        result = results[0]
        boxes = result.boxes

        annotated_img = result.plot()

        processed_result = {"file_name": file.filename, "detections": []}

        for box in boxes:
            class_name = model.names[int(box.cls)]
            detection = Detection(
                class_name=class_name,
                confidence=float(box.conf),
                bbox=box.xyxy[0].tolist(),
            )
            processed_result["detections"].append(detection)

        current_time = datetime.now(pytz.timezone("Asia/Seoul")).strftime("%Y-%m-%d %H:%M:%S")
        
        log_dir = "log"
        os.makedirs(log_dir, exist_ok=True)
        log_file_path = os.path.join(log_dir, new_file_name)
        cv2.imwrite(log_file_path, annotated_img)

        resResult = {
            "message": "Metal classification complete",
            "file_name": file.filename,
            "detections": processed_result["detections"],
            "result_image": new_file_name,
            "date": current_time,
        }

        return resResult

    except Exception as e:
        logger.error(f"Error occurred while processing image: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to process image.")

    finally:
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)
