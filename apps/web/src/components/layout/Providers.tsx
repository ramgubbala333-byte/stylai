"use client";

import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { useAuthStore } from "@/lib/hooks/useAuth";
import { getAccessToken } from "@/lib/api/client";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Rehydrates auth state on every page load/refresh
function AuthRehydrator() {
  const { fetchMe, isAuthenticated } = useAuthStore();

  useEffect(() => {
    // If we have a token cookie but the store doesn't know about it
    // (e.g. after a hard refresh), fetch the user to rehydrate
    const token = getAccessToken();
    if (token && !isAuthenticated) {
      fetchMe();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthRehydrator />
      {children}
    </QueryClientProvider>
  );
}
