"""
Skin Tone Analyzer — Computer Vision Module

Extracts the dominant skin tone from a face region and classifies it into:
1. Tone category (Fair → Rich using Monk Skin Tone scale-inspired mapping)
2. Undertone (Cool / Warm / Neutral) via Lab color space analysis

Methodology:
- Use MediaPipe Face Mesh to identify the cheek region (reliable, low shadow)
- Sample multiple patches from the forehead and cheeks to avoid shadows
- Convert RGB → Lab color space
- Use KMeans clustering to find the dominant skin color
- Map Lab values to tone and undertone categories

Lab color space is used because:
- L* = perceptual lightness (tone classification)
- a* = red/green axis (undertone: warm = high a*)
- b* = yellow/blue axis (undertone: warm = high b*)
- It's perceptually uniform, making thresholds more reliable across ethnicities
"""

import logging
from dataclasses import dataclass
from typing import Optional, Tuple

import cv2
import mediapipe as mp
import numpy as np
from sklearn.cluster import KMeans

logger = logging.getLogger(__name__)

# MediaPipe indices for cheek sampling patches
# These landmarks are on the central cheek area — low shadow probability
CHEEK_LANDMARKS = {
    "left_cheek": [50, 101, 118, 117, 111],
    "right_cheek": [280, 330, 347, 346, 340],
    "forehead": [10, 67, 109, 338, 297],
}

# Monk Skin Tone-inspired L* lightness thresholds
# Ref: Monk, 2023. "Introducing the Monk Skin Tone Scale"
TONE_LIGHTNESS_MAP = [
    (85, "fair"),    # L* > 85
    (78, "light"),   # L* 78–85
    (70, "medium"),  # L* 70–78
    (62, "olive"),   # L* 62–70
    (54, "tan"),     # L* 54–62
    (44, "deep"),    # L* 44–54
    (0,  "rich"),    # L* < 44
]

# Undertone classification via a* and b* in Lab space
# Warm skin: high b* (yellow) and moderate a* (redness)
# Cool skin: lower b*, can have higher a* (pink/rosy)
# Neutral: balanced a* and b*
UNDERTONE_THRESHOLDS = {
    "warm_b_min": 16,   # b* above this = warm tendency
    "cool_b_max": 13,   # b* below this = cool tendency
    "warm_a_range": (7, 22),  # a* range for warm
    "cool_a_range": (10, 25),  # a* range for cool (more pink/red)
}


@dataclass
class SkinAnalysisResult:
    """Output of skin tone and undertone analysis."""
    skin_tone: str           # e.g. "medium"
    skin_undertone: str      # "warm" | "cool" | "neutral"
    lab_values: dict         # Raw L*, a*, b* of dominant skin color
    hex_color: str           # Approximate skin hex color
    contrast_level: float    # 1–10 scale: how much contrast skin has with hair


class SkinAnalyzer:
    """
    Analyzes skin tone and undertone from an image of a face.
    Expects the image to already contain a detected face.
    """

    def analyze(self, image_bytes: bytes) -> Optional[SkinAnalysisResult]:
        """
        Main entry point. Accepts raw image bytes, returns SkinAnalysisResult.
        """
        img = self._decode_image(image_bytes)
        if img is None:
            return None

        skin_pixels = self._extract_skin_pixels(img)
        if skin_pixels is None or len(skin_pixels) < 10:
            logger.warning("Could not extract sufficient skin pixels")
            return None

        lab_dominant = self._dominant_color_lab(skin_pixels)
        if lab_dominant is None:
            return None

        skin_tone = self._classify_tone(lab_dominant)
        skin_undertone = self._classify_undertone(lab_dominant)
        hex_color = self._lab_to_hex(lab_dominant)
        contrast = self._estimate_contrast(img, skin_pixels)

        return SkinAnalysisResult(
            skin_tone=skin_tone,
            skin_undertone=skin_undertone,
            lab_values={
                "L": round(float(lab_dominant[0]), 2),
                "a": round(float(lab_dominant[1]), 2),
                "b": round(float(lab_dominant[2]), 2),
            },
            hex_color=hex_color,
            contrast_level=contrast,
        )

    def _decode_image(self, image_bytes: bytes) -> Optional[np.ndarray]:
        nparr = np.frombuffer(image_bytes, np.uint8)
        return cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    def _extract_skin_pixels(self, img: np.ndarray) -> Optional[np.ndarray]:
        """
        Use MediaPipe to find cheek/forehead landmark positions,
        sample RGB pixels from those regions, and return as an array.
        """
        rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        h, w = img.shape[:2]

        mp_face_mesh = mp.solutions.face_mesh
        with mp_face_mesh.FaceMesh(
            static_image_mode=True,
            max_num_faces=1,
            min_detection_confidence=0.5,
        ) as face_mesh:
            results = face_mesh.process(rgb)

        if not results.multi_face_landmarks:
            logger.info("No face landmarks for skin extraction")
            return None

        landmarks = results.multi_face_landmarks[0].landmark
        pixels = []

        for region, indices in CHEEK_LANDMARKS.items():
            for idx in indices:
                lm = landmarks[idx]
                px = int(lm.x * w)
                py = int(lm.y * h)

                # Sample a 5x5 patch around the landmark
                for dx in range(-5, 6, 2):
                    for dy in range(-5, 6, 2):
                        nx, ny = px + dx, py + dy
                        if 0 <= nx < w and 0 <= ny < h:
                            pixels.append(rgb[ny, nx])

        if not pixels:
            return None

        return np.array(pixels, dtype=np.float32)

    def _dominant_color_lab(self, pixels: np.ndarray) -> Optional[np.ndarray]:
        """
        Run KMeans (k=3) on extracted skin pixels, then return the
        most-populated cluster's center in Lab color space.
        """
        try:
            # Normalize to [0, 1] for KMeans
            pixels_norm = pixels / 255.0

            k = min(3, len(pixels))
            kmeans = KMeans(n_clusters=k, n_init=10, random_state=42)
            kmeans.fit(pixels_norm)

            # Find the cluster with most pixels
            labels, counts = np.unique(kmeans.labels_, return_counts=True)
            dominant_label = labels[np.argmax(counts)]
            dominant_rgb = kmeans.cluster_centers_[dominant_label]

            # Convert to uint8 RGB, then to Lab
            rgb_uint8 = (dominant_rgb * 255).astype(np.uint8).reshape(1, 1, 3)
            lab = cv2.cvtColor(rgb_uint8, cv2.COLOR_RGB2Lab)
            # OpenCV Lab: L in [0, 100] scaled to [0, 255], a/b shifted by 128
            # Convert to standard Lab range
            L = lab[0, 0, 0] * 100.0 / 255.0
            a = lab[0, 0, 1] - 128.0
            b = lab[0, 0, 2] - 128.0

            return np.array([L, a, b])

        except Exception as e:
            logger.error(f"KMeans clustering error: {e}")
            return None

    def _classify_tone(self, lab: np.ndarray) -> str:
        """Classify skin tone using L* lightness value."""
        L = lab[0]
        for threshold, tone_name in TONE_LIGHTNESS_MAP:
            if L > threshold:
                return tone_name
        return "rich"

    def _classify_undertone(self, lab: np.ndarray) -> str:
        """
        Classify undertone using a* and b* Lab values.

        Warm: high b* (yellow-orange) with moderate a* (redness)
        Cool: lower b*, higher a* relative to b* (pink/rosy/blue)
        Neutral: balanced
        """
        L, a, b = lab

        # Normalize by lightness — darker skin has naturally different a/b
        # Adjusted thresholds for darker tones
        lightness_factor = max(0.7, min(1.0, L / 70.0))
        warm_b_min = UNDERTONE_THRESHOLDS["warm_b_min"] * lightness_factor
        cool_b_max = UNDERTONE_THRESHOLDS["cool_b_max"] * lightness_factor

        if b >= warm_b_min and a < 18:
            return "warm"
        elif b <= cool_b_max or (a > 18 and b < warm_b_min):
            return "cool"
        else:
            return "neutral"

    def _lab_to_hex(self, lab: np.ndarray) -> str:
        """Convert Lab color to RGB hex string for display purposes."""
        L, a, b = lab
        # Reverse the OpenCV Lab encoding
        lab_cv = np.array([
            [[L * 255.0 / 100.0, a + 128.0, b + 128.0]]
        ], dtype=np.uint8)
        rgb = cv2.cvtColor(lab_cv, cv2.COLOR_Lab2RGB)
        r, g, b_val = rgb[0, 0]
        return f"#{r:02X}{g:02X}{b_val:02X}"

    def _estimate_contrast(
        self, img: np.ndarray, skin_pixels: np.ndarray
    ) -> float:
        """
        Estimate perceived contrast level (1–10) between skin and hair/eyes.
        Higher contrast = more dramatic recommendations are appropriate.

        Simple approach: compare average skin brightness to average dark-region brightness.
        """
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        avg_skin_brightness = float(np.mean(skin_pixels)) / 255.0

        # Dark regions = top 20% darkest pixels (approximating hair/brows)
        dark_threshold = np.percentile(gray, 15)
        dark_pixels = gray[gray <= dark_threshold]
        avg_dark = float(np.mean(dark_pixels)) / 255.0 if len(dark_pixels) > 0 else 0.1

        # Contrast = normalized difference, scaled to 1–10
        raw_contrast = max(0.0, avg_skin_brightness - avg_dark)
        contrast_score = 1.0 + (raw_contrast * 9.0)
        return round(min(10.0, max(1.0, contrast_score)), 2)
