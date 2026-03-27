import axios, { AxiosError, AxiosInstance, AxiosResponse } from "axios";
import Cookies from "js-cookie";
import {
  FullAnalysisResponse,
  StyleResult,
  AppearanceProfile,
  TokenResponse,
  User,
  UserLoginRequest,
  UserRegisterRequest,
  UserUpdateRequest,
} from "@/lib/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// ─── Axios instance ────────────────────────────────────────────────────────────

const api: AxiosInstance = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  headers: { "Content-Type": "application/json" },
  timeout: 60_000, // 60s for analysis requests
});

// ─── Request interceptor — attach token ───────────────────────────────────────

api.interceptors.request.use((config) => {
  const token = Cookies.get("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Response interceptor — handle 401 + token refresh ────────────────────────

let isRefreshing = false;
let failedQueue: Array<{ resolve: Function; reject: Function }> = [];

const processQueue = (error: Error | null, token?: string) => {
  failedQueue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve(token)
  );
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = Cookies.get("refresh_token");
      if (!refreshToken) {
        isRefreshing = false;
        clearTokens();
        if (typeof window !== "undefined") {
          window.location.href = "/auth/login";
        }
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post<TokenResponse>(
          `${BASE_URL}/api/v1/auth/refresh`,
          { refresh_token: refreshToken }
        );
        setTokens(data);
        processQueue(null, data.access_token);
        originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as Error);
        clearTokens();
        if (typeof window !== "undefined") {
          window.location.href = "/auth/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ─── Token helpers ────────────────────────────────────────────────────────────

export function setTokens(tokens: TokenResponse) {
  Cookies.set("access_token", tokens.access_token, {
    expires: tokens.expires_in / 86400, // seconds → days
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  Cookies.set("refresh_token", tokens.refresh_token, {
    expires: 30,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
}

export function clearTokens() {
  Cookies.remove("access_token");
  Cookies.remove("refresh_token");
}

export function getAccessToken(): string | undefined {
  return Cookies.get("access_token");
}

// ─── API methods ──────────────────────────────────────────────────────────────

export const authApi = {
  register: async (data: UserRegisterRequest): Promise<User> => {
    const res = await api.post<User>("/auth/register", data);
    return res.data;
  },

  login: async (data: UserLoginRequest): Promise<TokenResponse> => {
    const res = await api.post<TokenResponse>("/auth/login", data);
    return res.data;
  },
};

export const usersApi = {
  me: async (): Promise<User> => {
    const res = await api.get<User>("/users/me");
    return res.data;
  },

  update: async (data: UserUpdateRequest): Promise<User> => {
    const res = await api.patch<User>("/users/me", data);
    return res.data;
  },
};

export const analysisApi = {
  uploadSelfie: async (
    file: File,
    onProgress?: (pct: number) => void
  ): Promise<FullAnalysisResponse> => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await api.post<FullAnalysisResponse>("/analysis/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (evt) => {
        if (onProgress && evt.total) {
          onProgress(Math.round((evt.loaded / evt.total) * 100));
        }
      },
    });
    return res.data;
  },

  getLatestProfile: async (): Promise<AppearanceProfile> => {
    const res = await api.get<AppearanceProfile>("/analysis/profile/latest");
    return res.data;
  },

  getLatestResult: async (): Promise<StyleResult> => {
    const res = await api.get<StyleResult>("/analysis/results/latest");
    return res.data;
  },

  getResultById: async (id: string): Promise<StyleResult> => {
    const res = await api.get<StyleResult>(`/analysis/results/${id}`);
    return res.data;
  },

  getSharedResult: async (token: string): Promise<StyleResult> => {
    const res = await api.get<StyleResult>(`/analysis/share/${token}`);
    return res.data;
  },

  getHistory: async (): Promise<StyleResult[]> => {
    const res = await api.get<StyleResult[]>("/analysis/history");
    return res.data;
  },

  updateBeard: async (
    profileId: string,
    data: { beard_coverage: string; beard_density?: string }
  ): Promise<AppearanceProfile> => {
    const res = await api.patch<AppearanceProfile>(
      `/analysis/profile/${profileId}/beard`,
      data
    );
    return res.data;
  },
};

// ─── Error extraction helper ──────────────────────────────────────────────────

export function extractApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.detail ?? error.message ?? "Request failed";
  }
  if (error instanceof Error) return error.message;
  return "An unexpected error occurred";
}

export default api;
