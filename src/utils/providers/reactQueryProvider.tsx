"use client";

import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { useState } from "react";

const ReactQueryProvider = ({ children }: { children: React.ReactNode }) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Caching configuration
            staleTime: 2 * 60 * 1000, // Consider data fresh for 2 minutes
            cacheTime: 5 * 60 * 1000, // Keep unused data in cache for 5 minutes

            // Refetch configuration
            refetchOnWindowFocus: false, // Don't refetch when window regains focus
            refetchOnReconnect: true, // Refetch when network reconnects
            refetchOnMount: true, // Refetch when component mounts

            // Retry configuration
            retry: 1, // Retry failed requests once
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

            // Network mode (enables parallel queries)
            networkMode: 'online',
          },
          mutations: {
            // Retry configuration for mutations
            retry: false, // Don't retry mutations by default
            networkMode: 'online',
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

export default ReactQueryProvider;