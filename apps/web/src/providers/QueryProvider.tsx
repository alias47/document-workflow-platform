'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, type ReactNode } from 'react';

import type { HttpError } from '@/lib/http';

import { env } from '@/lib/env';

const STALE_TIME_MS = 60_000; // 1 minute — server data is fresh enough for a minute.
const GC_TIME_MS = 5 * 60_000; // 5 minutes — keep unused cache around briefly.
const MAX_RETRIES = 2;

/** Don't retry client errors (4xx) — only transient/server failures. */
function shouldRetry(failureCount: number, error: unknown): boolean {
  const status = (error as Partial<HttpError>)?.status;
  if (typeof status === 'number' && status >= 400 && status < 500) {
    return false;
  }
  return failureCount < MAX_RETRIES;
}

function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: STALE_TIME_MS,
        gcTime: GC_TIME_MS,
        retry: shouldRetry,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

export function QueryProvider({ children }: { children: ReactNode }) {
  // One client per browser session; useState keeps it stable across renders
  // and avoids sharing a client across requests during SSR.
  const [queryClient] = useState(createQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {env.isDev ? <ReactQueryDevtools initialIsOpen={false} /> : null}
    </QueryClientProvider>
  );
}
