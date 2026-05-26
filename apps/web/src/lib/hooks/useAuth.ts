import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authApi, clearTokens, setTokens, usersApi } from "@/lib/api/client";
import { User, UserLoginRequest, UserRegisterRequest } from "@/lib/types";

interface AuthState {
  user: User|null; isLoading: boolean; isAuthenticated: boolean; error: string|null;
  login: (d: UserLoginRequest) => Promise<void>;
  register: (d: UserRegisterRequest) => Promise<void>;
  logout: () => void;
  fetchMe: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(persist((set) => ({
  user: null, isLoading: false, isAuthenticated: false, error: null,
  login: async (d) => {
    set({isLoading:true,error:null});
    try { const t = await authApi.login(d); setTokens(t); const u = await usersApi.me(); set({user:u,isAuthenticated:true,isLoading:false}); }
    catch(e:any) { set({error:e?.response?.data?.detail??"Login failed",isLoading:false}); throw e; }
  },
  register: async (d) => {
    set({isLoading:true,error:null});
    try { await authApi.register(d); const t = await authApi.login({email:d.email,password:d.password}); setTokens(t); const u = await usersApi.me(); set({user:u,isAuthenticated:true,isLoading:false}); }
    catch(e:any) { set({error:e?.response?.data?.detail??"Registration failed",isLoading:false}); throw e; }
  },
  logout: () => { clearTokens(); set({user:null,isAuthenticated:false,error:null}); if(typeof window!=="undefined") window.location.href="/"; },
  fetchMe: async () => { try { const u = await usersApi.me(); set({user:u,isAuthenticated:true}); } catch { set({user:null,isAuthenticated:false}); } },
  clearError: () => set({error:null}),
}), { name: "stylai-auth", partialize: s => ({user:s.user,isAuthenticated:s.isAuthenticated}) }));
