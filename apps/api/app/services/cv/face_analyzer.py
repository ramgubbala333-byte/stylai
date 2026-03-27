"""
Face Analyzer — Computer Vision Module

Uses MediaPipe Face Mesh to extract 468 3D facial landmarks, then derives
geometric ratios to classify face shape. This module only extracts features —
it does NOT make style recommendations.

Face shape classification methodology:
- Measures face width, cheekbone width, forehead width, jawline width, face length
- Computes ratios and maps to standard shape categories
- Confidence score is derived from how strongly ratios match a canonical shape

Reference landmarks (MediaPipe 468-point mesh, subset):
- Forehead: 10, 338, 297, 332, 284
- Cheekbones: 234, 454
- Jawline: 172, 397, 136, 365
- Chin: 152
- Face length: 10 → 152
"""

import logging
from dataclasses import dataclass
from typing import Optional

import cv2
import mediapipe as mp
import numpy as np
from PIL import Image

logger = logging.getLogger(__name__)

# MediaPipe landmark indices for key facial measurements
LANDMARK_INDICES = {
    "forehead_left": 103,
    "forehead_right": 332,
    "cheek_left": 234,
    "cheek_right": 454,
    "jaw_left": 172,
    "jaw_right": 397,
    "chin": 152,
    "top_of_head": 10,
    "left_temple": 127,
    "right_temple": 356,
}


@dataclass
class FaceGeometry:
    """Raw geometric measurements extracted from face landmarks."""
    face_length: float          # Top of head to chin
    face_width: float           # Widest horizontal measurement (cheekbones)
    forehead_width: float       # Width at forehead level
    jawline_width: float        # Width at jawline level
    cheekbone_width: float      # Width at cheekbone level
    upper_face_ratio: float     # forehead_width / cheekbone_width
    lower_face_ratio: float     # jawline_width / cheekbone_width
    length_to_width_ratio: float  # face_length / cheekbone_width


@dataclass
class FaceAnalysisResult:
    """Output of face shape detection."""
    face_shape: str
    confidence: float           # 0.0–1.0
    landmark_ratios: dict       # Raw ratios for auditability
    bounding_box: Optional[dict] = None  # {x, y, w, h} normalized


class FaceAnalyzer:
    """
    Stateless face shape analyzer.
    Instantiate once and call `analyze()` for each image.
    """

    def __init__(self, model_complexity: int = 1):
        self.mp_face_mesh = mp.solutions.face_mesh
        self.model_complexity = model_complexity

    def analyze(self, image_bytes: bytes) -> Optional[FaceAnalysisResult]:
        """
        Main entry point: accepts raw image bytes, returns FaceAnalysisResult.

        Args:
            image_bytes: Raw bytes of the uploaded image (JPEG/PNG/WebP)

        Returns:
            FaceAnalysisResult or None if no face detected
        """
        img_array = self._decode_image(image_bytes)
        if img_array is None:
            logger.warning("Failed to decode image")
            return None

        landmarks = self._extract_landmarks(img_array)
        if landmarks is None:
            logger.info("No face detected in image")
            return None

        geometry = self._compute_geometry(landmarks, img_array.shape)
        face_shape, confidence = self._classify_face_shape(geometry)

        return FaceAnalysisResult(
            face_shape=face_shape,
            confidence=confidence,
            landmark_ratios={
                "face_length": round(geometry.face_length, 4),
                "face_width": round(geometry.face_width, 4),
                "forehead_width": round(geometry.forehead_width, 4),
                "jawline_width": round(geometry.jawline_width, 4),
                "cheekbone_width": round(geometry.cheekbone_width, 4),
                "upper_face_ratio": round(geometry.upper_face_ratio, 4),
                "lower_face_ratio": round(geometry.lower_face_ratio, 4),
                "length_to_width_ratio": round(geometry.length_to_width_ratio, 4),
            },
        )

    def _decode_image(self, image_bytes: bytes) -> Optional[np.ndarray]:
        """Convert raw bytes to BGR numpy array for OpenCV."""
        try:
            nparr = np.frombuffer(image_bytes, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            return img
        except Exception as e:
            logger.error(f"Image decode error: {e}")
            return None

    def _extract_landmarks(self, img: np.ndarray) -> Optional[np.ndarray]:
        """
        Run MediaPipe Face Mesh and return the 468 landmarks as an array
        of shape (468, 3) in normalized coordinates [0, 1].
        """
        rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

        with self.mp_face_mesh.FaceMesh(
            static_image_mode=True,
            max_num_faces=1,
            refine_landmarks=True,
            min_detection_confidence=0.5,
            model_complexity=self.model_complexity,
        ) as face_mesh:
            results = face_mesh.process(rgb)

        if not results.multi_face_landmarks:
            return None

        landmarks = results.multi_face_landmarks[0]
        return np.array([[lm.x, lm.y, lm.z] for lm in landmarks.landmark])

    def _get_landmark(self, landmarks: np.ndarray, key: str) -> np.ndarray:
        """Get a specific landmark by its semantic name."""
        idx = LANDMARK_INDICES[key]
        return landmarks[idx]

    def _euclidean_dist(self, a: np.ndarray, b: np.ndarray) -> float:
        """2D Euclidean distance between two (x, y, z) landmark points."""
        return float(np.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2))

    def _compute_geometry(
        self, landmarks: np.ndarray, img_shape: tuple
    ) -> FaceGeometry:
        """
        Derive geometric measurements from face landmarks.
        All measurements are in normalized coordinates [0, 1].
        """
        lm = lambda key: self._get_landmark(landmarks, key)
        dist = self._euclidean_dist

        face_length = dist(lm("top_of_head"), lm("chin"))
        cheekbone_width = dist(lm("cheek_left"), lm("cheek_right"))
        forehead_width = dist(lm("left_temple"), lm("right_temple"))
        jawline_width = dist(lm("jaw_left"), lm("jaw_right"))

        # Face width = max of all horizontal measurements
        face_width = max(cheekbone_width, forehead_width, jawline_width)

        return FaceGeometry(
            face_length=face_length,
            face_width=face_width,
            forehead_width=forehead_width,
            jawline_width=jawline_width,
            cheekbone_width=cheekbone_width,
            upper_face_ratio=forehead_width / cheekbone_width if cheekbone_width > 0 else 1.0,
            lower_face_ratio=jawline_width / cheekbone_width if cheekbone_width > 0 else 1.0,
            length_to_width_ratio=face_length / face_width if face_width > 0 else 1.0,
        )

    def _classify_face_shape(self, g: FaceGeometry) -> tuple[str, float]:
        """
        Map geometric ratios to a face shape category using a rule-based classifier.

        Rules derived from classical facial geometry and beauty analysis standards:
        - Oval:     length/width 1.3–1.5, forehead ≈ cheekbones, jaw slightly narrower
        - Round:    length/width ~1.0, soft jaw, cheekbones widest
        - Square:   length/width ~1.0–1.2, strong jaw ≈ cheekbone width
        - Heart:    forehead > cheekbones > jaw, pointed chin
        - Diamond:  cheekbones widest, narrow forehead AND jaw
        - Oblong:   length/width > 1.5, all widths similar
        - Triangle: jaw > cheekbones > forehead
        """
        lwr = g.length_to_width_ratio  # length-to-width ratio
        ufr = g.upper_face_ratio       # forehead / cheekbone
        lfr = g.lower_face_ratio       # jawline / cheekbone

        scores = {}

        # ── Oval ──────────────────────────────────────────────────────────────
        oval_score = 0.0
        if 1.3 <= lwr <= 1.55:
            oval_score += 0.5
        if 0.85 <= ufr <= 1.05:
            oval_score += 0.3
        if 0.7 <= lfr <= 0.9:
            oval_score += 0.2
        scores["oval"] = oval_score

        # ── Round ─────────────────────────────────────────────────────────────
        round_score = 0.0
        if 1.0 <= lwr <= 1.2:
            round_score += 0.5
        if 0.9 <= ufr <= 1.05:
            round_score += 0.2
        if 0.85 <= lfr <= 1.0:
            round_score += 0.3
        scores["round"] = round_score

        # ── Square ────────────────────────────────────────────────────────────
        square_score = 0.0
        if 1.0 <= lwr <= 1.25:
            square_score += 0.4
        if 0.9 <= ufr <= 1.05:
            square_score += 0.2
        if 0.9 <= lfr <= 1.05:
            square_score += 0.4
        scores["square"] = square_score

        # ── Heart ─────────────────────────────────────────────────────────────
        heart_score = 0.0
        if ufr > 1.05:
            heart_score += 0.5
        if lfr < 0.75:
            heart_score += 0.3
        if 1.2 <= lwr <= 1.6:
            heart_score += 0.2
        scores["heart"] = heart_score

        # ── Diamond ───────────────────────────────────────────────────────────
        diamond_score = 0.0
        if ufr < 0.85:
            diamond_score += 0.4
        if lfr < 0.8:
            diamond_score += 0.4
        if 1.2 <= lwr <= 1.6:
            diamond_score += 0.2
        scores["diamond"] = diamond_score

        # ── Oblong ────────────────────────────────────────────────────────────
        oblong_score = 0.0
        if lwr > 1.55:
            oblong_score += 0.7
        if 0.85 <= ufr <= 1.05:
            oblong_score += 0.15
        if 0.85 <= lfr <= 1.05:
            oblong_score += 0.15
        scores["oblong"] = oblong_score

        # ── Triangle ──────────────────────────────────────────────────────────
        triangle_score = 0.0
        if lfr > 1.05:
            triangle_score += 0.5
        if ufr < 0.9:
            triangle_score += 0.3
        if 1.0 <= lwr <= 1.4:
            triangle_score += 0.2
        scores["triangle"] = triangle_score

        # Pick the highest scorer
        best_shape = max(scores, key=lambda k: scores[k])
        best_confidence = min(scores[best_shape], 1.0)

        if best_confidence < 0.3:
            return "unknown", best_confidence

        return best_shape, best_confidence
