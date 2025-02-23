export interface Detection {
  class_name: string;
  confidence: GLfloat;
  bbox: number[];
  timestamp: string;
}

export interface DetectionResponse {
  id: number;
  has_detection: boolean;
  confidence_score: number;
  detections: Detection[];
  message: string;
  image_url?: string;
}