"""
Style Recommendation Engine — Rule-Based Core

This module maps appearance features to style recommendations using a
deterministic, explainable rule set. This is the core intelligence of StylAI.

Architecture:
- `BaseStyleEngine`: Shared logic for colors, season classification
- `MenStyleEngine`: Extends base with beard and men's haircut logic
- `WomenStyleEngine`: Extends base with neckline and women's-specific logic
- Each recommendation includes a `reason` string for explainability

Rule sources:
- Color theory: Seasonal color analysis (Zyla, Kibbe systems)
- Face shape styling: Classic fashion/grooming guidelines (Esquire, GQ, Vogue)
- Beard guidance: Grooming literature and barber standards
- Hairstyle: Trichology and professional styling guides

IMPORTANT: This engine only interprets features. It does NOT call any AI APIs.
The optional LLM layer is a separate module that wraps this output in narrative prose.
"""

from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional


@dataclass
class ColorRecommendation:
    hex: str
    name: str
    reason: str


@dataclass
class StyleRecommendation:
    name: str
    reason: str
    category: str  # e.g. "hairstyle", "beard", "outfit"
    image_ref: Optional[str] = None  # Future: reference image key


@dataclass
class RecommendationOutput:
    """Complete output of the style engine for one user."""
    color_season: str
    recommended_colors: List[ColorRecommendation]
    colors_to_avoid: List[ColorRecommendation]
    hairstyle_recommendations: List[StyleRecommendation]
    hairstyles_to_avoid: List[StyleRecommendation]
    beard_recommendations: List[StyleRecommendation]
    outfit_directions: List[StyleRecommendation]
    clothing_details: Dict[str, Any]
    engine_version: str = "1.0.0"


# ─── Color Season Database ─────────────────────────────────────────────────────
# Maps (undertone, contrast_level) to seasonal archetype and palettes
# Based on classical 12-season color analysis

COLOR_SEASONS = {
    # (undertone, contrast_bucket): season_name
    ("cool", "high"): "Deep Winter",
    ("cool", "medium"): "True Winter",
    ("cool", "low"): "Light Summer",
    ("warm", "high"): "Deep Autumn",
    ("warm", "medium"): "True Autumn",
    ("warm", "low"): "Light Spring",
    ("neutral", "high"): "Clear Spring",
    ("neutral", "medium"): "True Summer",
    ("neutral", "low"): "Soft Summer",
}

SEASON_PALETTES = {
    "Deep Winter": {
        "recommended": [
            {"hex": "#1C1C2E", "name": "Midnight Navy", "reason": "Deep, rich tones anchor your high-contrast coloring beautifully"},
            {"hex": "#8B0000", "name": "Deep Crimson", "reason": "Bold reds complement your cool, dramatic coloring"},
            {"hex": "#2E4057", "name": "Steel Teal", "reason": "Cool-toned mid-darks work with your skin's blue undertones"},
            {"hex": "#FFFFFF", "name": "Pure White", "reason": "High-contrast whites create striking definition near your face"},
            {"hex": "#4B0082", "name": "Royal Purple", "reason": "Deep purples are a signature Deep Winter power color"},
            {"hex": "#006994", "name": "Cobalt Blue", "reason": "Saturated cool blues bring out the depth in your complexion"},
        ],
        "avoid": [
            {"hex": "#F5DEB3", "name": "Wheat/Beige", "reason": "Warm, muted neutrals clash with your cool undertone and wash you out"},
            {"hex": "#DAA520", "name": "Goldenrod", "reason": "Warm yellows create unflattering contrast with cool-toned skin"},
            {"hex": "#DEB887", "name": "Burlywood", "reason": "Orange-browns dull your complexion's natural clarity"},
        ],
    },
    "True Winter": {
        "recommended": [
            {"hex": "#000000", "name": "True Black", "reason": "Clean black creates elegant contrast with your cool, clear coloring"},
            {"hex": "#C0C0C0", "name": "Silver", "reason": "Silver metallics harmonize with your cool undertones"},
            {"hex": "#4169E1", "name": "Royal Blue", "reason": "Saturated cool blues are a power color for True Winters"},
            {"hex": "#DC143C", "name": "Crimson Red", "reason": "True cool reds — not orange-reds — are flattering and dramatic"},
            {"hex": "#008080", "name": "Teal", "reason": "Blue-greens complement your cool-neutral clarity"},
            {"hex": "#F0F8FF", "name": "Ice White", "reason": "Cool whites and icy pastels brighten the face naturally"},
        ],
        "avoid": [
            {"hex": "#FF7F50", "name": "Coral", "reason": "Warm coral fights your cool undertone"},
            {"hex": "#F4A460", "name": "Sandy Brown", "reason": "Warm earth tones dull your natural coolness"},
        ],
    },
    "True Autumn": {
        "recommended": [
            {"hex": "#8B4513", "name": "Saddle Brown", "reason": "Rich earthy browns resonate perfectly with warm, golden undertones"},
            {"hex": "#B8860B", "name": "Dark Goldenrod", "reason": "Warm golds and mustards are signature Autumn shades"},
            {"hex": "#556B2F", "name": "Olive Green", "reason": "Muted, warm greens complement the Autumn palette naturally"},
            {"hex": "#A0522D", "name": "Sienna", "reason": "Terracotta tones mirror the warmth in your skin and eyes"},
            {"hex": "#CD853F", "name": "Peru Tan", "reason": "Warm, muted camel tones are universally flattering on Autumns"},
            {"hex": "#8B0000", "name": "Burgundy", "reason": "Deep warm reds with brown undertones suit the Autumn palette"},
        ],
        "avoid": [
            {"hex": "#000080", "name": "Navy Blue", "reason": "Cool, clear navy creates unflattering contrast with warm undertones"},
            {"hex": "#FF69B4", "name": "Hot Pink", "reason": "Cool pinks fight the warmth in your complexion"},
            {"hex": "#808080", "name": "Medium Grey", "reason": "Cool greys neutralize the golden glow of warm skin"},
        ],
    },
    "Light Spring": {
        "recommended": [
            {"hex": "#FFDAB9", "name": "Peach Blush", "reason": "Soft warm peaches echo the delicacy of your light, warm coloring"},
            {"hex": "#90EE90", "name": "Light Green", "reason": "Fresh, warm-toned greens brighten light Spring complexions"},
            {"hex": "#FFD700", "name": "Warm Gold", "reason": "Clear, warm yellows illuminate fair warm skin beautifully"},
            {"hex": "#87CEEB", "name": "Sky Blue", "reason": "Light, airy blues add freshness without overwhelming"},
            {"hex": "#FFC0CB", "name": "Warm Pink", "reason": "Peachy pinks are quintessential Spring colors"},
            {"hex": "#DEB887", "name": "Warm Beige", "reason": "Light camel tones blend harmoniously with your undertone"},
        ],
        "avoid": [
            {"hex": "#000000", "name": "Black", "reason": "Heavy black overwhelms delicate light Spring coloring"},
            {"hex": "#800000", "name": "Dark Maroon", "reason": "Deep, cool-dark shades create jarring contrast"},
        ],
    },
    "Soft Summer": {
        "recommended": [
            {"hex": "#B0C4DE", "name": "Light Steel Blue", "reason": "Muted, cool-neutral blues harmonize with your softness"},
            {"hex": "#D3D3D3", "name": "Light Grey", "reason": "Soft greys blend seamlessly with your neutral-cool coloring"},
            {"hex": "#BC8F8F", "name": "Rosy Brown", "reason": "Dusty, muted pinks complement your soft, blended features"},
            {"hex": "#8FBC8F", "name": "Sage Green", "reason": "Muted sage is a quintessential Soft Summer color"},
            {"hex": "#E6E6FA", "name": "Lavender", "reason": "Soft, dusty purples create gentle harmony with your complexion"},
        ],
        "avoid": [
            {"hex": "#FF4500", "name": "Orange Red", "reason": "Bright, warm orange-reds clash with your cool, muted nature"},
            {"hex": "#FFFF00", "name": "Bright Yellow", "reason": "High-saturation warm yellows overpower soft coloring"},
        ],
    },
    # Fallback for unclassified or unknown seasons
    "default": {
        "recommended": [
            {"hex": "#4A4A4A", "name": "Charcoal", "reason": "A versatile neutral that works across many complexions"},
            {"hex": "#F5F5F5", "name": "Off White", "reason": "Soft whites are broadly flattering"},
            {"hex": "#6B8E6B", "name": "Sage", "reason": "Muted greens complement most skin tones"},
            {"hex": "#8B7355", "name": "Warm Taupe", "reason": "Neutral taupes work well across undertones"},
        ],
        "avoid": [
            {"hex": "#FFFF00", "name": "Neon Yellow", "reason": "Extreme saturation is rarely flattering next to the face"},
        ],
    },
}

# ─── Face Shape Style Rules ────────────────────────────────────────────────────

HAIRSTYLE_RULES = {
    "oval": {
        "recommended": [
            {"name": "Most cuts work", "reason": "Oval faces are the most versatile — virtually any silhouette is flattering"},
            {"name": "Layered cuts", "reason": "Layers enhance natural movement without structural concern"},
            {"name": "Middle part", "reason": "Balanced parting works well with oval symmetry"},
            {"name": "Textured top", "reason": "Volume on top elongates beautifully without imbalance"},
        ],
        "avoid": [
            {"name": "Extremely long and flat", "reason": "Flat styles without any volume can flatten oval features"},
        ],
    },
    "round": {
        "recommended": [
            {"name": "Volume on top (height)", "reason": "Vertical volume elongates a round face, creating oval illusion"},
            {"name": "Side-swept styles", "reason": "Asymmetric parting creates visual length and breaks circular symmetry"},
            {"name": "Angular cuts with definition", "reason": "Defined angles at jaw level narrow the appearance"},
            {"name": "Undercut with textured top", "reason": "Keeps sides controlled while adding height"},
        ],
        "avoid": [
            {"name": "Blunt, chin-length bobs", "reason": "Cuts that end at jaw level widen the apparent face width"},
            {"name": "Volume at sides/ears", "reason": "Side volume makes round faces appear wider"},
            {"name": "Curly styles around face", "reason": "Volume around the face exaggerates roundness"},
        ],
    },
    "square": {
        "recommended": [
            {"name": "Textured layers", "reason": "Softens the angular jawline and adds movement"},
            {"name": "Side parts and waves", "reason": "Diagonal lines break the strong horizontal jaw symmetry"},
            {"name": "Quiff or pompadour", "reason": "Adds oval-like height without adding jaw width"},
            {"name": "Soft fringe / curtain bangs", "reason": "Softens the forehead line and overall squareness"},
        ],
        "avoid": [
            {"name": "Blunt straight cuts", "reason": "Emphasize the jaw's squareness"},
            {"name": "Very short sides with square top", "reason": "Creates a boxy overall silhouette"},
        ],
    },
    "heart": {
        "recommended": [
            {"name": "Volume at jaw level", "reason": "Adds width at the chin to balance a wider forehead"},
            {"name": "Side parts with length", "reason": "Side-swept styles minimize forehead emphasis"},
            {"name": "Chin-length bobs", "reason": "Ends at the chin to visually widen the narrower jaw"},
            {"name": "Wispy bangs", "reason": "Soft fringe reduces forehead visual width"},
        ],
        "avoid": [
            {"name": "Volume at top/forehead", "reason": "Amplifies the already-wide forehead"},
            {"name": "Very short sides with height", "reason": "Creates a top-heavy pyramid effect"},
        ],
    },
    "diamond": {
        "recommended": [
            {"name": "Width at forehead AND chin", "reason": "Balances the widest point (cheekbones) by widening extremes"},
            {"name": "Brow-grazing fringe", "reason": "Widens the appearance of a narrow forehead"},
            {"name": "Chin-length layers", "reason": "Adds volume at the jawline to counterbalance cheekbone width"},
        ],
        "avoid": [
            {"name": "Volume at cheekbone height", "reason": "Amplifies the already-prominent widest point"},
            {"name": "Slicked-back styles", "reason": "Reveals the narrow forehead without balance"},
        ],
    },
    "oblong": {
        "recommended": [
            {"name": "Volume at sides", "reason": "Width on the sides counters an elongated face shape"},
            {"name": "Horizontal layers", "reason": "Horizontal lines shorten the visual face length"},
            {"name": "Fringe", "reason": "Bangs break the vertical length and add width"},
            {"name": "Curly and wavy styles", "reason": "Natural width and texture reduce elongation"},
        ],
        "avoid": [
            {"name": "Very long straight styles", "reason": "Further elongates an already long face"},
            {"name": "Height without width", "reason": "Vertical-only volume exaggerates length"},
        ],
    },
    "triangle": {
        "recommended": [
            {"name": "Volume on top", "reason": "Width at the crown and forehead balances a wide jaw"},
            {"name": "Layered on top, close at sides of jaw", "reason": "Redirects visual emphasis upward"},
            {"name": "Undercut with textured top", "reason": "Minimizes sides to reduce jaw width perception"},
        ],
        "avoid": [
            {"name": "Full, voluminous at jaw", "reason": "Amplifies the widest point of a triangle face"},
        ],
    },
    "unknown": {
        "recommended": [
            {"name": "Consult a professional stylist", "reason": "Face shape detection was inconclusive — an in-person assessment will be more accurate"},
        ],
        "avoid": [],
    },
}

BEARD_RULES = {
    "oval": {
        "recommended": [
            {"name": "Any style works", "reason": "Oval faces are versatile — experiment freely"},
            {"name": "Short boxed beard", "reason": "Clean, structured look that highlights facial harmony"},
            {"name": "Classic stubble", "reason": "Effortless, universally attractive on balanced features"},
        ],
    },
    "round": {
        "recommended": [
            {"name": "Goatee or chin beard", "reason": "Chin elongation creates the illusion of a longer, more oval face"},
            {"name": "Angular beard (square-shaped trim)", "reason": "Adds definition and angularity to soften roundness"},
            {"name": "Longer beard at chin, shorter sides", "reason": "Vertical elongation is the key principle for round faces"},
        ],
        "avoid": [
            {"name": "Full round beard", "reason": "Amplifies circularity — avoid volume all around"},
            {"name": "Short all-over stubble without shaping", "reason": "Accentuates the round perimeter without adding structure"},
        ],
    },
    "square": {
        "recommended": [
            {"name": "Rounded beard at chin", "reason": "Soft chin shape counterbalances a strong square jaw"},
            {"name": "Full beard with softer edges", "reason": "Volume softens angular jaw definition"},
            {"name": "Classic full beard (well-groomed)", "reason": "The strong jaw actually suits a full beard very well"},
        ],
        "avoid": [
            {"name": "Sharp angular beard that mirrors jaw", "reason": "Doubles down on squareness rather than balancing it"},
        ],
    },
    "heart": {
        "recommended": [
            {"name": "Full beard", "reason": "Adds volume at the jaw to balance a wider forehead"},
            {"name": "Chin strap", "reason": "Defines the jawline and adds perceived width"},
            {"name": "Thick goatee", "reason": "Anchors the narrow chin visually"},
        ],
        "avoid": [
            {"name": "Sideburns only", "reason": "Adds volume at cheeks/temples where you already have width"},
        ],
    },
    "oblong": {
        "recommended": [
            {"name": "Full beard with volume on sides", "reason": "Side volume adds width to counteract elongation"},
            {"name": "Mustache with short beard", "reason": "Horizontal lines from the mustache shorten perceived length"},
        ],
        "avoid": [
            {"name": "Pointed, long chin beard", "reason": "Amplifies the elongated face length"},
        ],
    },
    "diamond": {
        "recommended": [
            {"name": "Full beard", "reason": "Adds width at the chin to balance prominent cheekbones"},
            {"name": "Short beard with wide base", "reason": "Chin width is the goal for diamond faces"},
        ],
        "avoid": [
            {"name": "Sideburns or cheek beards", "reason": "Adds unwanted volume at the already-widest cheekbone area"},
        ],
    },
    "triangle": {
        "recommended": [
            {"name": "Goatee (short, clean)", "reason": "Keeps the jaw area refined without adding bulk"},
            {"name": "Light stubble", "reason": "Texture without mass — doesn't widen an already-wide jaw"},
        ],
        "avoid": [
            {"name": "Full bushy beard at jaw", "reason": "Further widens the already-broad jaw area"},
        ],
    },
    "unknown": {
        "recommended": [
            {"name": "Classic medium stubble", "reason": "A safe, universally flattering beard length across most face shapes"},
        ],
    },
}

OUTFIT_RULES = {
    # Necklines by face shape
    "necklines": {
        "oval": ["V-neck", "Crew neck", "Square neck", "Any neckline"],
        "round": ["V-neck", "Deep V", "Open collar", "Scoop neck"],
        "square": ["Round neck", "Scoop neck", "Cowl neck", "Soft lapels"],
        "heart": ["Boat neck", "Square neck", "Off-shoulder", "Scoop neck"],
        "oblong": ["Crew neck", "Turtleneck", "Boat neck", "High necklines"],
        "diamond": ["Boat neck", "Off-shoulder", "Square neck", "Halter"],
        "triangle": ["V-neck", "Plunging necklines", "Open collar"],
        "unknown": ["V-neck"],
    },
    # Fits that work universally
    "universal_fits": [
        {"name": "Well-fitted through the shoulder", "reason": "Shoulder fit is the most important dimension — always have this right"},
        {"name": "Tapered at waist (not baggy)", "reason": "Defined waist creates proportion and visual height"},
    ],
}


# ─── Base Engine ───────────────────────────────────────────────────────────────

class BaseStyleEngine:
    """
    Shared recommendation logic for all users.
    Gender-specific engines extend this class.
    """

    ENGINE_VERSION = "1.0.0"

    def _get_contrast_bucket(self, contrast_level: float) -> str:
        if contrast_level >= 6.5:
            return "high"
        elif contrast_level >= 3.5:
            return "medium"
        else:
            return "low"

    def _get_color_season(self, undertone: str, contrast_level: float) -> str:
        bucket = self._get_contrast_bucket(contrast_level)
        return COLOR_SEASONS.get((undertone, bucket), "True Summer")

    def _get_color_recommendations(self, season: str) -> tuple:
        palette = SEASON_PALETTES.get(season, SEASON_PALETTES["default"])
        recommended = [ColorRecommendation(**c) for c in palette["recommended"]]
        avoid = [ColorRecommendation(**c) for c in palette["avoid"]]
        return recommended, avoid

    def _get_hairstyle_recommendations(self, face_shape: str) -> tuple:
        rules = HAIRSTYLE_RULES.get(face_shape, HAIRSTYLE_RULES["unknown"])
        recommended = [
            StyleRecommendation(category="hairstyle", **r)
            for r in rules["recommended"]
        ]
        avoid = [
            StyleRecommendation(category="hairstyle", **r)
            for r in rules.get("avoid", [])
        ]
        return recommended, avoid

    def _get_outfit_recommendations(self, face_shape: str) -> tuple[List[StyleRecommendation], dict]:
        necklines = OUTFIT_RULES["necklines"].get(face_shape, OUTFIT_RULES["necklines"]["unknown"])
        directions = [
            StyleRecommendation(
                name="Best necklines for your face shape",
                reason=f"These cuts frame your {face_shape} face optimally: {', '.join(necklines[:3])}",
                category="outfit",
            )
        ] + [StyleRecommendation(category="outfit", **f) for f in OUTFIT_RULES["universal_fits"]]

        clothing_details = {
            "recommended_necklines": necklines,
            "fit_principles": [
                "Shoulder seam should align exactly with shoulder edge",
                "Trouser break at top of shoe — not pooling",
                "Shirt should button without pulling across chest",
            ],
        }
        return directions, clothing_details


# ─── Men's Style Engine ───────────────────────────────────────────────────────

class MenStyleEngine(BaseStyleEngine):
    """
    Recommendation engine for male users.
    Adds beard-specific recommendations on top of base logic.
    """

    def generate(
        self,
        face_shape: str,
        skin_undertone: str,
        contrast_level: float,
        beard_coverage: Optional[str] = None,
        hair_texture: Optional[str] = None,
    ) -> RecommendationOutput:

        season = self._get_color_season(skin_undertone, contrast_level)
        rec_colors, avoid_colors = self._get_color_recommendations(season)
        rec_hair, avoid_hair = self._get_hairstyle_recommendations(face_shape)
        rec_outfits, clothing_details = self._get_outfit_recommendations(face_shape)
        beard_recs = self._get_beard_recommendations(face_shape, beard_coverage)

        return RecommendationOutput(
            color_season=season,
            recommended_colors=rec_colors,
            colors_to_avoid=avoid_colors,
            hairstyle_recommendations=rec_hair,
            hairstyles_to_avoid=avoid_hair,
            beard_recommendations=beard_recs,
            outfit_directions=rec_outfits,
            clothing_details=clothing_details,
            engine_version=self.ENGINE_VERSION,
        )

    def _get_beard_recommendations(
        self, face_shape: str, beard_coverage: Optional[str]
    ) -> List[StyleRecommendation]:
        rules = BEARD_RULES.get(face_shape, BEARD_RULES["unknown"])
        recs = [StyleRecommendation(category="beard", **r) for r in rules["recommended"]]

        # Augment with beard coverage-specific note
        if beard_coverage == "patchy":
            recs.append(StyleRecommendation(
                name="Work with your natural growth pattern",
                reason="Patchy beard growth suits shorter styles like stubble or a targeted chin/goatee that doesn't rely on full coverage",
                category="beard",
            ))
        elif beard_coverage == "full":
            recs.append(StyleRecommendation(
                name="Grooming frequency matters",
                reason="With full coverage you can achieve any beard style — invest in a quality trimmer for clean lines",
                category="beard",
            ))

        return recs


# ─── Women's Style Engine ─────────────────────────────────────────────────────

class WomenStyleEngine(BaseStyleEngine):
    """
    Recommendation engine for female and non-binary users.
    Extends base with women's neckline and body-shape-aware recommendations.
    """

    def generate(
        self,
        face_shape: str,
        skin_undertone: str,
        contrast_level: float,
        hair_texture: Optional[str] = None,
    ) -> RecommendationOutput:

        season = self._get_color_season(skin_undertone, contrast_level)
        rec_colors, avoid_colors = self._get_color_recommendations(season)
        rec_hair, avoid_hair = self._get_hairstyle_recommendations(face_shape)
        rec_outfits, clothing_details = self._get_outfit_recommendations(face_shape)

        return RecommendationOutput(
            color_season=season,
            recommended_colors=rec_colors,
            colors_to_avoid=avoid_colors,
            hairstyle_recommendations=rec_hair,
            hairstyles_to_avoid=avoid_hair,
            beard_recommendations=[],  # N/A for women
            outfit_directions=rec_outfits,
            clothing_details=clothing_details,
            engine_version=self.ENGINE_VERSION,
        )
