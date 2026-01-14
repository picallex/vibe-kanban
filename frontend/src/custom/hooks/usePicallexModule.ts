/**
 * JPBot Custom Extensions - Picallex Module Hook
 *
 * Hook for fetching OpenAPI endpoints for a selected module from S3.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { getModuleUrl, PICALLEX_CONFIG } from '../config';
import type { PicallexModule } from '../types/modules';
import type { ModuleOpenApiResponse, OpenApiEndpoint } from '../types/openapi';

interface UsePicallexModuleOptions {
  moduleId: PicallexModule | null;
}

interface UsePicallexModuleReturn {
  endpoints: OpenApiEndpoint[];
  loading: boolean;
  error: string | null;
  tokenCount: number;
  refresh: () => void;
}

// Simple in-memory cache
const cache = new Map<
  string,
  { data: ModuleOpenApiResponse; timestamp: number }
>();

export function usePicallexModule({
  moduleId,
}: UsePicallexModuleOptions): UsePicallexModuleReturn {
  const [endpoints, setEndpoints] = useState<OpenApiEndpoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tokenCount, setTokenCount] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchModule = useCallback(
    async (forceRefresh = false) => {
      if (!moduleId) {
        setEndpoints([]);
        setTokenCount(0);
        setError(null);
        return;
      }

      // Check cache first
      const cacheKey = moduleId;
      const cached = cache.get(cacheKey);
      const now = Date.now();

      if (
        !forceRefresh &&
        cached &&
        now - cached.timestamp < PICALLEX_CONFIG.CACHE_STALE_TIME
      ) {
        setEndpoints(cached.data.endpoints);
        setTokenCount(cached.data.tokenCount);
        setError(null);
        return;
      }

      // Cancel any pending request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      setLoading(true);
      setError(null);

      try {
        const url = getModuleUrl(moduleId);
        const response = await fetch(url, {
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch module: ${response.status}`);
        }

        const data: ModuleOpenApiResponse = await response.json();

        // Update cache
        cache.set(cacheKey, { data, timestamp: now });

        setEndpoints(data.endpoints);
        setTokenCount(data.tokenCount);
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          // Request was cancelled, ignore
          return;
        }
        const message =
          err instanceof Error ? err.message : 'Failed to fetch module';
        setError(message);
        setEndpoints([]);
        setTokenCount(0);
      } finally {
        setLoading(false);
      }
    },
    [moduleId]
  );

  // Fetch on mount and when moduleId changes
  useEffect(() => {
    fetchModule();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchModule]);

  const refresh = useCallback(() => {
    fetchModule(true);
  }, [fetchModule]);

  return {
    endpoints,
    loading,
    error,
    tokenCount,
    refresh,
  };
}

/**
 * Clear the module cache (useful for testing or forcing refresh)
 */
export function clearModuleCache(): void {
  cache.clear();
}
