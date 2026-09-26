"use client";

import React, { useState, useEffect } from "react";
import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { store, useAppDispatch } from "@/store";
import { logout, setCredentials } from "@/store/authSlice";
import { AuthGuard } from "@/components/auth/AuthGuard";

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const storedUser = localStorage.getItem("aurora_user");

    if (!storedUser) {
      dispatch(logout());
      return;
    }

    try {
      const user = JSON.parse(storedUser);

      dispatch(
        setCredentials({
          token: null,
          user,
        }),
      );
    } catch {
      localStorage.removeItem("aurora_user");
      dispatch(logout());
    }
  }, [dispatch]);

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AuthInitializer>{children}</AuthInitializer>
      </QueryClientProvider>
    </Provider>
  );
}
