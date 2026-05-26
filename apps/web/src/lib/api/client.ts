import axios, { AxiosInstance, AxiosError } from "axios";
import Cookies from "js-cookie";
import { FullAnalysisResponse, StyleResult, AppearanceProfile, TokenResponse, User, UserLoginRequest, UserRegisterRequest, UserUpdateRequest } from "@/lib/types";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const api: AxiosInstance = axios.create({ baseURL: `${BASE}/api/v1`, headers: { "Content-Type": "application/json" }, timeout: 60000 });

api.interceptors.request.use(cfg => { const t = Cookies.get("access_token"); if(t) cfg.headers.Authorization = `Bearer ${t}`; return cfg; });

let refreshing = false;
let queue: {resolve:Function;reject:Function}[] = [];
const flush = (err:Error|null, token?:string) => { queue.forEach(p => err ? p.reject(err) : p.resolve(token)); queue = []; };

api.interceptors.response.use(r => r, async (err: AxiosError) => {
  const orig = err.config as any;
  if(err.response?.status === 401 && !orig._retry) {
    if(refreshing) return new Promise((res,rej) => queue.push({resolve:res,reject:rej})).then(t => { orig.headers.Authorization = `Bearer ${t}`; return api(orig); });
    orig._retry = true; refreshing = true;
    const rt = Cookies.get("refresh_token");
    if(!rt) { refreshing = false; clearTokens(); if(typeof window!=="undefined") window.location.href="/auth/login"; return Promise.reject(err); }
    try {
      const {data} = await axios.post<TokenResponse>(`${BASE}/api/v1/auth/refresh`, {refresh_token:rt});
      setTokens(data); flush(null, data.access_token); orig.headers.Authorization = `Bearer ${data.access_token}`; return api(orig);
    } catch(e) { flush(e as Error); clearTokens(); if(typeof window!=="undefined") window.location.href="/auth/login"; return Promise.reject(e); }
    finally { refreshing = false; }
  }
  return Promise.reject(err);
});

export function setTokens(t: TokenResponse) {
  Cookies.set("access_token", t.access_token, { expires: t.expires_in/86400, secure: process.env.NODE_ENV==="production", sameSite: "strict" });
  Cookies.set("refresh_token", t.refresh_token, { expires: 30, secure: process.env.NODE_ENV==="production", sameSite: "strict" });
}
export function clearTokens() { Cookies.remove("access_token"); Cookies.remove("refresh_token"); }
export function getAccessToken() { return Cookies.get("access_token"); }

export const authApi = {
  register: async (d: UserRegisterRequest): Promise<User> => (await api.post<User>("/auth/register", d)).data,
  login: async (d: UserLoginRequest): Promise<TokenResponse> => (await api.post<TokenResponse>("/auth/login", d)).data,
};
export const usersApi = {
  me: async (): Promise<User> => (await api.get<User>("/users/me")).data,
  update: async (d: UserUpdateRequest): Promise<User> => (await api.patch<User>("/users/me", d)).data,
};
export const analysisApi = {
  uploadSelfie: async (file: File, onProgress?: (p:number)=>void): Promise<FullAnalysisResponse> => {
    const fd = new FormData(); fd.append("file", file);
    return (await api.post<FullAnalysisResponse>("/analysis/upload", fd, { headers: {"Content-Type":"multipart/form-data"}, onUploadProgress: e => onProgress && e.total && onProgress(Math.round(e.loaded/e.total*100)) })).data;
  },
  getLatestProfile: async (): Promise<AppearanceProfile> => (await api.get<AppearanceProfile>("/analysis/profile/latest")).data,
  getLatestResult: async (): Promise<StyleResult> => (await api.get<StyleResult>("/analysis/results/latest")).data,
  getResultById: async (id: string): Promise<StyleResult> => (await api.get<StyleResult>(`/analysis/results/${id}`)).data,
  getSharedResult: async (token: string): Promise<StyleResult> => (await api.get<StyleResult>(`/analysis/share/${token}`)).data,
  getHistory: async (): Promise<StyleResult[]> => (await api.get<StyleResult[]>("/analysis/history")).data,
  updateBeard: async (pid: string, d: {beard_coverage:string;beard_density?:string}): Promise<AppearanceProfile> => (await api.patch<AppearanceProfile>(`/analysis/profile/${pid}/beard`, d)).data,
};
export function extractApiError(e: unknown): string {
  if(axios.isAxiosError(e)) return e.response?.data?.detail ?? e.message ?? "Request failed";
  if(e instanceof Error) return e.message;
  return "An unexpected error occurred";
}
export default api;
