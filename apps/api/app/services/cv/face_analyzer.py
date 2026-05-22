import logging
from dataclasses import dataclass
from typing import Optional
import cv2
import mediapipe as mp
import numpy as np

logger = logging.getLogger(__name__)

LANDMARK_INDICES = {"forehead_left":103,"forehead_right":332,"cheek_left":234,"cheek_right":454,"jaw_left":172,"jaw_right":397,"chin":152,"top_of_head":10,"left_temple":127,"right_temple":356}

@dataclass
class FaceAnalysisResult:
    face_shape: str
    confidence: float
    landmark_ratios: dict

class FaceAnalyzer:
    def __init__(self, model_complexity: int = 1):
        self.mp_face_mesh = mp.solutions.face_mesh
        self.model_complexity = model_complexity

    def analyze(self, image_bytes: bytes) -> Optional[FaceAnalysisResult]:
        try:
            nparr = np.frombuffer(image_bytes, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            if img is None: return None
            rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            with self.mp_face_mesh.FaceMesh(static_image_mode=True, max_num_faces=1, min_detection_confidence=0.5, model_complexity=self.model_complexity) as fm:
                results = fm.process(rgb)
            if not results.multi_face_landmarks: return None
            lms = np.array([[l.x, l.y, l.z] for l in results.multi_face_landmarks[0].landmark])
            def lm(k): return lms[LANDMARK_INDICES[k]]
            def d(a, b): return float(np.sqrt((a[0]-b[0])**2 + (a[1]-b[1])**2))
            fl = d(lm("top_of_head"), lm("chin"))
            cw = d(lm("cheek_left"), lm("cheek_right"))
            fw = d(lm("left_temple"), lm("right_temple"))
            jw = d(lm("jaw_left"), lm("jaw_right"))
            mx = max(cw, fw, jw)
            lwr = fl / mx if mx > 0 else 1.0
            ufr = fw / cw if cw > 0 else 1.0
            lfr = jw / cw if cw > 0 else 1.0
            scores = {
                "oval": (0.5 if 1.3<=lwr<=1.55 else 0) + (0.3 if 0.85<=ufr<=1.05 else 0) + (0.2 if 0.7<=lfr<=0.9 else 0),
                "round": (0.5 if 1.0<=lwr<=1.2 else 0) + (0.2 if 0.9<=ufr<=1.05 else 0) + (0.3 if 0.85<=lfr<=1.0 else 0),
                "square": (0.4 if 1.0<=lwr<=1.25 else 0) + (0.2 if 0.9<=ufr<=1.05 else 0) + (0.4 if 0.9<=lfr<=1.05 else 0),
                "heart": (0.5 if ufr>1.05 else 0) + (0.3 if lfr<0.75 else 0) + (0.2 if 1.2<=lwr<=1.6 else 0),
                "diamond": (0.4 if ufr<0.85 else 0) + (0.4 if lfr<0.8 else 0) + (0.2 if 1.2<=lwr<=1.6 else 0),
                "oblong": (0.7 if lwr>1.55 else 0) + (0.15 if 0.85<=ufr<=1.05 else 0) + (0.15 if 0.85<=lfr<=1.05 else 0),
                "triangle": (0.5 if lfr>1.05 else 0) + (0.3 if ufr<0.9 else 0) + (0.2 if 1.0<=lwr<=1.4 else 0),
            }
            best = max(scores, key=lambda k: scores[k])
            conf = min(scores[best], 1.0)
            if conf < 0.3: best, conf = "unknown", conf
            return FaceAnalysisResult(face_shape=best, confidence=conf, landmark_ratios={"lwr":round(lwr,4),"ufr":round(ufr,4),"lfr":round(lfr,4)})
        except Exception as e:
            logger.error(f"Face analysis error: {e}")
            return None