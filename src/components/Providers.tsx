'use client';

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export function Providers({ children }: { readonly children: React.ReactNode }): React.ReactElement {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Data stays fresh for 60s — won't refetch during this window
            staleTime: 60 * 1000,
            // Keep unused data in cache for 10 minutes before GC
            gcTime: 10 * 60 * 1000,
            retry: 1,
            // Don't refetch when window regains focus (reduces unnecessary calls)
            refetchOnWindowFocus: false,
            // Don't refetch on reconnect unless data is stale
            refetchOnReconnect: 'always',
          },
          mutations: {
            retry: 1,
          },
        },
      })
  );

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
