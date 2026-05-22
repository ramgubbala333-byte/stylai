import logging
from dataclasses import dataclass
from typing import Optional
import cv2
import mediapipe as mp
import numpy as np
from sklearn.cluster import KMeans

logger = logging.getLogger(__name__)

CHEEK_LANDMARKS = {"left_cheek":[50,101,118,117,111],"right_cheek":[280,330,347,346,340],"forehead":[10,67,109,338,297]}

@dataclass
class SkinAnalysisResult:
    skin_tone: str
    skin_undertone: str
    lab_values: dict
    hex_color: str
    contrast_level: float

class SkinAnalyzer:
    def analyze(self, image_bytes: bytes) -> Optional[SkinAnalysisResult]:
        try:
            nparr = np.frombuffer(image_bytes, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            if img is None: return None
            rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            h, w = img.shape[:2]
            with mp.solutions.face_mesh.FaceMesh(static_image_mode=True, max_num_faces=1, min_detection_confidence=0.5) as fm:
                results = fm.process(rgb)
            if not results.multi_face_landmarks: return None
            lms = results.multi_face_landmarks[0].landmark
            pixels = []
            for region, indices in CHEEK_LANDMARKS.items():
                for idx in indices:
                    lm = lms[idx]
                    px, py = int(lm.x * w), int(lm.y * h)
                    for dx in range(-5, 6, 2):
                        for dy in range(-5, 6, 2):
                            nx, ny = px+dx, py+dy
                            if 0 <= nx < w and 0 <= ny < h:
                                pixels.append(rgb[ny, nx])
            if len(pixels) < 10: return None
            pixels_arr = np.array(pixels, dtype=np.float32)
            k = min(3, len(pixels_arr))
            km = KMeans(n_clusters=k, n_init=10, random_state=42)
            km.fit(pixels_arr / 255.0)
            labels, counts = np.unique(km.labels_, return_counts=True)
            dom = km.cluster_centers_[labels[np.argmax(counts)]]
            rgb_u8 = (dom * 255).astype(np.uint8).reshape(1,1,3)
            lab = cv2.cvtColor(rgb_u8, cv2.COLOR_RGB2Lab)
            L = lab[0,0,0] * 100.0 / 255.0
            a = float(lab[0,0,1]) - 128.0
            b = float(lab[0,0,2]) - 128.0
            tone_map = [(85,"fair"),(78,"light"),(70,"medium"),(62,"olive"),(54,"tan"),(44,"deep"),(0,"rich")]
            tone = next((t for thresh, t in tone_map if L > thresh), "rich")
            lf = max(0.7, min(1.0, L/70.0))
            undertone = "warm" if b >= 16*lf and a < 18 else "cool" if b <= 13*lf or (a > 18 and b < 16*lf) else "neutral"
            lab_cv2 = np.array([[[L*255/100, a+128, b+128]]], dtype=np.uint8)
            rgb_back = cv2.cvtColor(lab_cv2, cv2.COLOR_Lab2RGB)
            r2,g2,b2 = rgb_back[0,0]
            hex_color = f"#{r2:02X}{g2:02X}{b2:02X}"
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            avg_skin = float(np.mean(pixels_arr)) / 255.0
            dark_thresh = np.percentile(gray, 15)
            dark_pix = gray[gray <= dark_thresh]
            avg_dark = float(np.mean(dark_pix)) / 255.0 if len(dark_pix) > 0 else 0.1
            contrast = round(min(10.0, max(1.0, 1.0 + (max(0.0, avg_skin - avg_dark) * 9.0))), 2)
            return SkinAnalysisResult(skin_tone=tone, skin_undertone=undertone, lab_values={"L":round(L,2),"a":round(a,2),"b":round(b,2)}, hex_color=hex_color, contrast_level=contrast)
        except Exception as e:
            logger.error(f"Skin analysis error: {e}")
            return None