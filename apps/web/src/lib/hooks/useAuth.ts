import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  authApi,
  clearTokens,
  setTokens,
  usersApi,
} from "@/lib/api/client";
import { User, UserLoginRequest, UserRegisterRequest } from "@/lib/types";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;

  login: (data: UserLoginRequest) => Promise<void>;
  register: (data: UserRegisterRequest) => Promise<void>;
  logout: () => void;
  fetchMe: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,

      login: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const tokens = await authApi.login(data);
          setTokens(tokens);
          const user = await usersApi.me();
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (err: any) {
          const message =
            err?.response?.data?.detail ?? "Login failed. Please try again.";
          set({ error: message, isLoading: false });
          throw err;
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          await authApi.register(data);
          // Auto-login after registration
          const tokens = await authApi.login({
            email: data.email,
            password: data.password,
          });
          setTokens(tokens);
          const user = await usersApi.me();
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (err: any) {
          const message =
            err?.response?.data?.detail ?? "Registration failed. Please try again.";
          set({ error: message, isLoading: false });
          throw err;
        }
      },

      logout: () => {
        clearTokens();
        set({ user: null, isAuthenticated: false, error: null });
        if (typeof window !== "undefined") {
          window.location.href = "/auth/login";
        }
      },

      fetchMe: async () => {
        try {
          const user = await usersApi.me();
          set({ user, isAuthenticated: true });
        } catch {
          set({ user: null, isAuthenticated: false });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "stylai-auth",
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
