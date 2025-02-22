from pydantic import BaseModel
from typing import List, Union

class Detection(BaseModel):
    class_name: str  # metal type (e.g., "steel", "aluminum", "copper")
    confidence: float
    bbox: List[float]

class PredictMetalSchema(BaseModel):
    message: str
    file_name: Union[str, None]
    detections: List[Detection]
    result_image: Union[str, None]
    date: str