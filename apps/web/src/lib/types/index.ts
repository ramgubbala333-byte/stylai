// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface UserRegisterRequest {
  email: string;
  password: string;
  full_name?: string;
  gender?: Gender;
}

export interface UserLoginRequest {
  email: string;
  password: string;
}

// ─── User ─────────────────────────────────────────────────────────────────────

export type Gender = "male" | "female" | "non_binary" | "prefer_not_to_say";

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  gender: Gender | null;
  is_active: boolean;
  created_at: string;
}

export interface UserUpdateRequest {
  full_name?: string;
  gender?: Gender;
  date_of_birth?: string;
}

// ─── Analysis ─────────────────────────────────────────────────────────────────

export type FaceShape =
  | "oval" | "round" | "square" | "heart"
  | "diamond" | "oblong" | "triangle" | "unknown";

export type SkinTone =
  | "fair" | "light" | "medium" | "olive" | "tan" | "deep" | "rich";

export type SkinUndertone = "cool" | "warm" | "neutral";

export type HairTexture = "straight" | "wavy" | "curly" | "coily" | "unknown";

export type AnalysisStatus = "pending" | "processing" | "completed" | "failed";

export interface AppearanceProfile {
  id: string;
  user_id: string;
  is_active: boolean;
  selfie_url: string;
  analysis_status: AnalysisStatus;
  analysis_error: string | null;
  analyzed_at: string | null;
  face_shape: FaceShape | null;
  face_shape_confidence: number | null;
  skin_tone: SkinTone | null;
  skin_undertone: SkinUndertone | null;
  contrast_level: number | null;
  hair_color_hex: string | null;
  hair_texture: HairTexture | null;
  hair_density: string | null;
  beard_coverage: string | null;
  created_at: string;
}

// ─── Recommendations ──────────────────────────────────────────────────────────

export interface ColorRecommendation {
  hex: string;
  name: string;
  reason: string;
}

export interface StyleRecommendation {
  name: string;
  reason: string;
  category: string;
  image_ref?: string | null;
}

export interface StyleResult {
  id: string;
  user_id: string;
  appearance_profile_id: string;
  color_season: string | null;
  recommended_colors: ColorRecommendation[] | null;
  colors_to_avoid: ColorRecommendation[] | null;
  hairstyle_recommendations: StyleRecommendation[] | null;
  hairstyles_to_avoid: StyleRecommendation[] | null;
  beard_recommendations: StyleRecommendation[] | null;
  outfit_directions: StyleRecommendation[] | null;
  clothing_details: Record<string, unknown> | null;
  narrative_summary: string | null;
  share_token: string | null;
  result_card_url: string | null;
  engine_version: string;
  created_at: string;
}

export interface FullAnalysisResponse {
  profile: AppearanceProfile;
  result: StyleResult | null;
  message: string;
}

// ─── UI State ─────────────────────────────────────────────────────────────────

export interface ApiError {
  detail: string;
  code?: string;
}
