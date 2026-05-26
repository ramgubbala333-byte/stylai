"use client";
import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { useAuthStore } from "@/lib/hooks/useAuth";
import { getAccessToken } from "@/lib/api/client";

const queryClient = new QueryClient({ defaultOptions: { queries: { retry:1, refetchOnWindowFocus:false, staleTime:5*60*1000 } } });

function AuthRehydrator() {
  const { fetchMe, isAuthenticated } = useAuthStore();
  useEffect(() => { if(getAccessToken() && !isAuthenticated) fetchMe(); }, []); // eslint-disable-line
  return null;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={queryClient}><AuthRehydrator />{children}</QueryClientProvider>;
}