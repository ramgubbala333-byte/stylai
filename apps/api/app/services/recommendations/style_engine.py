from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional

@dataclass
class ColorRecommendation:
    hex: str; name: str; reason: str

@dataclass
class StyleRecommendation:
    name: str; reason: str; category: str; image_ref: Optional[str] = None

@dataclass
class RecommendationOutput:
    color_season: str
    recommended_colors: List[ColorRecommendation]
    colors_to_avoid: List[ColorRecommendation]
    hairstyle_recommendations: List[StyleRecommendation]
    hairstyles_to_avoid: List[StyleRecommendation]
    beard_recommendations: List[StyleRecommendation]
    outfit_directions: List[StyleRecommendation]
    clothing_details: Dict[str, Any]
    engine_version: str = "1.0.0"

COLOR_SEASONS = {
    ("cool","high"):"Deep Winter",("cool","medium"):"True Winter",("cool","low"):"Light Summer",
    ("warm","high"):"Deep Autumn",("warm","medium"):"True Autumn",("warm","low"):"Light Spring",
    ("neutral","high"):"Clear Spring",("neutral","medium"):"True Summer",("neutral","low"):"Soft Summer",
}

SEASON_PALETTES = {
    "Deep Autumn": {
        "recommended":[
            {"hex":"#8B4513","name":"Saddle Brown","reason":"Rich earthy browns resonate perfectly with warm, golden undertones."},
            {"hex":"#B8860B","name":"Dark Goldenrod","reason":"Warm golds and mustards are signature Deep Autumn shades."},
            {"hex":"#556B2F","name":"Olive Green","reason":"Muted warm greens complement your palette naturally."},
            {"hex":"#A0522D","name":"Sienna","reason":"Terracotta tones mirror the warmth in your skin and eyes."},
            {"hex":"#8B0000","name":"Deep Burgundy","reason":"Rich warm reds with brown undertones suit Deep Autumn perfectly."},
            {"hex":"#CD853F","name":"Peru Camel","reason":"Warm muted camel tones are universally flattering on Autumns."},
        ],
        "avoid":[
            {"hex":"#000080","name":"Navy Blue","reason":"Cool clear navy creates unflattering contrast with warm undertones."},
            {"hex":"#FF69B4","name":"Hot Pink","reason":"Cool pinks fight the warmth in your complexion."},
            {"hex":"#808080","name":"Medium Grey","reason":"Cool greys neutralize your golden glow."},
        ]
    },
    "Deep Winter": {
        "recommended":[
            {"hex":"#1C1C2E","name":"Midnight Navy","reason":"Deep rich tones anchor your high-contrast coloring."},
            {"hex":"#8B0000","name":"Deep Crimson","reason":"Bold reds complement your cool dramatic coloring."},
            {"hex":"#FFFFFF","name":"Pure White","reason":"High-contrast whites create striking definition."},
            {"hex":"#4B0082","name":"Royal Purple","reason":"Deep purples are a signature Deep Winter power color."},
            {"hex":"#006994","name":"Cobalt Blue","reason":"Saturated cool blues bring out depth in your complexion."},
            {"hex":"#2E4057","name":"Steel Teal","reason":"Cool-toned mid-darks work with your skin tone beautifully."},
        ],
        "avoid":[
            {"hex":"#F5DEB3","name":"Wheat/Beige","reason":"Warm muted neutrals clash with your cool undertone."},
            {"hex":"#DAA520","name":"Goldenrod","reason":"Warm yellows create unflattering contrast with cool skin."},
            {"hex":"#DEB887","name":"Burlywood","reason":"Orange-browns dull your complexion clarity."},
        ]
    },
    "default": {
        "recommended":[
            {"hex":"#4A4A4A","name":"Charcoal","reason":"A versatile neutral that works across many complexions."},
            {"hex":"#F5F5F5","name":"Off White","reason":"Soft whites are broadly flattering."},
            {"hex":"#6B8E6B","name":"Sage","reason":"Muted greens complement most skin tones."},
            {"hex":"#8B7355","name":"Warm Taupe","reason":"Neutral taupes work well across undertones."},
            {"hex":"#4169E1","name":"Royal Blue","reason":"Classic blue works for most people."},
            {"hex":"#722F37","name":"Wine","reason":"Deep wine tones are universally sophisticated."},
        ],
        "avoid":[
            {"hex":"#FFFF00","name":"Neon Yellow","reason":"Extreme saturation is rarely flattering near the face."},
        ]
    }
}

for key in ["True Winter","True Autumn","Light Spring","Clear Spring","Light Summer","True Summer","Soft Summer"]:
    if key not in SEASON_PALETTES:
        SEASON_PALETTES[key] = SEASON_PALETTES["default"]

HAIRSTYLE_RULES = {
    "oval":{"recommended":[{"name":"Most cuts work","reason":"Oval faces are the most versatile — virtually any silhouette is flattering."},{"name":"Layered cuts","reason":"Layers enhance natural movement without structural concern."},{"name":"Textured top","reason":"Volume on top elongates beautifully without imbalance."}],"avoid":[{"name":"Extremely flat styles","reason":"Flat styles without volume can make features appear less dynamic."}]},
    "round":{"recommended":[{"name":"Volume on top","reason":"Vertical volume elongates a round face, creating an oval illusion."},{"name":"Side-swept styles","reason":"Asymmetric parting creates visual length and breaks circular symmetry."},{"name":"Angular cuts","reason":"Defined angles at jaw level narrow the appearance."}],"avoid":[{"name":"Blunt chin-length bobs","reason":"Cuts at jaw level widen the apparent face width."},{"name":"Volume at sides","reason":"Side volume makes round faces appear wider."}]},
    "square":{"recommended":[{"name":"Textured layers","reason":"Softens the angular jawline and adds movement."},{"name":"Side parts and waves","reason":"Diagonal lines break strong horizontal jaw symmetry."},{"name":"Soft fringe","reason":"Softens the forehead line and overall squareness."}],"avoid":[{"name":"Blunt straight cuts","reason":"Emphasize the jaw squareness."}]},
    "heart":{"recommended":[{"name":"Volume at jaw level","reason":"Adds width at the chin to balance a wider forehead."},{"name":"Chin-length bobs","reason":"Ends at chin to visually widen the narrower jaw."},{"name":"Wispy bangs","reason":"Soft fringe reduces forehead visual width."}],"avoid":[{"name":"Volume at forehead","reason":"Amplifies the already-wide forehead."}]},
    "diamond":{"recommended":[{"name":"Width at forehead and chin","reason":"Balances the widest point by widening extremes."},{"name":"Brow-grazing fringe","reason":"Widens the appearance of a narrow forehead."}],"avoid":[{"name":"Volume at cheekbone height","reason":"Amplifies the already-prominent widest point."}]},
    "oblong":{"recommended":[{"name":"Volume at sides","reason":"Width on the sides counters an elongated face shape."},{"name":"Fringe","reason":"Bangs break the vertical length and add width."}],"avoid":[{"name":"Very long straight styles","reason":"Further elongates an already long face."}]},
    "triangle":{"recommended":[{"name":"Volume on top","reason":"Width at crown and forehead balances a wide jaw."},{"name":"Undercut with textured top","reason":"Minimizes sides to reduce jaw width perception."}],"avoid":[{"name":"Full volume at jaw","reason":"Amplifies the widest point of a triangle face."}]},
    "unknown":{"recommended":[{"name":"Classic medium length","reason":"A versatile length that suits most face shapes."}],"avoid":[]},
}

BEARD_RULES = {
    "oval":{"recommended":[{"name":"Any style works","reason":"Oval faces are versatile — experiment freely."},{"name":"Classic stubble","reason":"Effortless and universally attractive on balanced features."}]},
    "round":{"recommended":[{"name":"Goatee or chin beard","reason":"Chin elongation creates the illusion of a longer more oval face."},{"name":"Angular beard","reason":"Adds definition and angularity to soften roundness."}],"avoid":[{"name":"Full round beard","reason":"Amplifies circularity — avoid volume all around."}]},
    "square":{"recommended":[{"name":"Rounded beard at chin","reason":"Soft chin shape counterbalances a strong square jaw."},{"name":"Full beard with softer edges","reason":"Volume softens angular jaw definition."}]},
    "heart":{"recommended":[{"name":"Full beard","reason":"Adds volume at jaw to balance a wider forehead."},{"name":"Thick goatee","reason":"Anchors the narrow chin visually."}]},
    "oblong":{"recommended":[{"name":"Full beard with volume on sides","reason":"Side volume adds width to counteract elongation."},{"name":"Mustache with short beard","reason":"Horizontal lines shorten perceived length."}]},
    "diamond":{"recommended":[{"name":"Full beard","reason":"Adds width at chin to balance prominent cheekbones."}]},
    "triangle":{"recommended":[{"name":"Goatee short and clean","reason":"Keeps the jaw area refined without adding bulk."},{"name":"Light stubble","reason":"Texture without mass — does not widen an already-wide jaw."}]},
    "unknown":{"recommended":[{"name":"Classic medium stubble","reason":"A safe universally flattering beard length across most face shapes."}]},
}

class BaseStyleEngine:
    ENGINE_VERSION = "1.0.0"

    def _contrast_bucket(self, c): return "high" if c >= 6.5 else "medium" if c >= 3.5 else "low"

    def _get_season(self, undertone, contrast):
        return COLOR_SEASONS.get((undertone, self._contrast_bucket(contrast)), "True Summer")

    def _get_colors(self, season):
        p = SEASON_PALETTES.get(season, SEASON_PALETTES["default"])
        return [ColorRecommendation(**c) for c in p["recommended"]], [ColorRecommendation(**c) for c in p["avoid"]]

    def _get_hairstyles(self, face_shape):
        r = HAIRSTYLE_RULES.get(face_shape, HAIRSTYLE_RULES["unknown"])
        return ([StyleRecommendation(category="hairstyle", **x) for x in r["recommended"]],
                [StyleRecommendation(category="hairstyle", **x) for x in r.get("avoid", [])])

    def _get_outfits(self, face_shape):
        necklines = {"oval":["V-neck","Crew neck","Square neck","Any neckline"],"round":["V-neck","Deep V","Open collar"],"square":["Round neck","Scoop neck","Cowl neck"],"heart":["Boat neck","Square neck","Off-shoulder"],"oblong":["Crew neck","Turtleneck","Boat neck"],"diamond":["Boat neck","Off-shoulder","Square neck"],"triangle":["V-neck","Plunging necklines"],"unknown":["V-neck"]}.get(face_shape, ["V-neck"])
        directions = [StyleRecommendation(name="Best necklines for your face shape", reason=f"These cuts frame your {face_shape} face optimally: {', '.join(necklines[:3])}", category="outfit"),
                      StyleRecommendation(name="Well-fitted through the shoulder", reason="Shoulder fit is the most important dimension — always get this right.", category="outfit"),
                      StyleRecommendation(name="Tapered at waist not baggy", reason="Defined waist creates proportion and visual height.", category="outfit")]
        details = {"recommended_necklines": necklines, "fit_principles": ["Shoulder seam should align exactly with shoulder edge","Trouser break at top of shoe — not pooling","Shirt should button without pulling across chest"]}
        return directions, details

class MenStyleEngine(BaseStyleEngine):
    def generate(self, face_shape, skin_undertone, contrast_level, beard_coverage=None, **kwargs):
        season = self._get_season(skin_undertone, contrast_level)
        rc, ac = self._get_colors(season)
        rh, ah = self._get_hairstyles(face_shape)
        ro, cd = self._get_outfits(face_shape)
        br = BEARD_RULES.get(face_shape, BEARD_RULES["unknown"])
        beards = [StyleRecommendation(category="beard", **x) for x in br["recommended"]]
        if beard_coverage == "patchy":
            beards.append(StyleRecommendation(name="Work with your natural growth", reason="Patchy growth suits shorter styles like stubble or a targeted goatee.", category="beard"))
        return RecommendationOutput(color_season=season, recommended_colors=rc, colors_to_avoid=ac, hairstyle_recommendations=rh, hairstyles_to_avoid=ah, beard_recommendations=beards, outfit_directions=ro, clothing_details=cd, engine_version=self.ENGINE_VERSION)

class WomenStyleEngine(BaseStyleEngine):
    def generate(self, face_shape, skin_undertone, contrast_level, **kwargs):
        season = self._get_season(skin_undertone, contrast_level)
        rc, ac = self._get_colors(season)
        rh, ah = self._get_hairstyles(face_shape)
        ro, cd = self._get_outfits(face_shape)
        return RecommendationOutput(color_season=season, recommended_colors=rc, colors_to_avoid=ac, hairstyle_recommendations=rh, hairstyles_to_avoid=ah, beard_recommendations=[], outfit_directions=ro, clothing_details=cd, engine_version=self.ENGINE_VERSION)