/**
 * JPBot Custom Extensions - Endpoint Analyzer Hook
 *
 * Hook for analyzing descriptions and detecting missing endpoints.
 */

import { useState, useEffect, useRef } from 'react';
import { usePicallexModule } from './usePicallexModule';
import { analyzeDescription } from '../utils/endpointMatcher';
import { PICALLEX_CONFIG } from '../config';
import type { PicallexModule } from '../types/modules';
import type { MissingEndpointInfo, OpenApiEndpoint } from '../types/openapi';

interface UseEndpointAnalyzerOptions {
  moduleId: PicallexModule | null;
  description: string;
  enabled?: boolean;
}

interface UseEndpointAnalyzerReturn {
  /**
   * Whether the analysis is in progress
   */
  isAnalyzing: boolean;

  /**
   * Whether all required endpoints exist
   */
  isComplete: boolean;

  /**
   * List of endpoints that match the description
   */
  matchedEndpoints: OpenApiEndpoint[];

  /**
   * List of missing endpoints with Jira descriptions
   */
  missingEndpoints: MissingEndpointInfo[];

  /**
   * Error message if analysis failed
   */
  error: string | null;
}

export function useEndpointAnalyzer({
  moduleId,
  description,
  enabled = PICALLEX_CONFIG.ENABLE_ENDPOINT_ANALYSIS,
}: UseEndpointAnalyzerOptions): UseEndpointAnalyzerReturn {
  const { endpoints, loading: moduleLoading, error: moduleError } = usePicallexModule({ moduleId });

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isComplete, setIsComplete] = useState(true);
  const [matchedEndpoints, setMatchedEndpoints] = useState<OpenApiEndpoint[]>([]);
  const [missingEndpoints, setMissingEndpoints] = useState<MissingEndpointInfo[]>([]);
  const [error, setError] = useState<string | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Clear previous timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Reset state if disabled or no module
    if (!enabled || !moduleId) {
      setIsComplete(true);
      setMatchedEndpoints([]);
      setMissingEndpoints([]);
      setError(null);
      return;
    }

    // Wait for module to load
    if (moduleLoading) {
      setIsAnalyzing(true);
      return;
    }

    // Handle module error
    if (moduleError) {
      setError(moduleError);
      setIsAnalyzing(false);
      return;
    }

    // Skip if description is too short
    if (description.trim().length < 10) {
      setIsComplete(true);
      setMatchedEndpoints([]);
      setMissingEndpoints([]);
      setIsAnalyzing(false);
      return;
    }

    // Debounce the analysis
    setIsAnalyzing(true);
    debounceRef.current = setTimeout(() => {
      try {
        const result = analyzeDescription(description, endpoints);

        setIsComplete(result.isComplete);
        setMatchedEndpoints(result.matchedEndpoints);
        setMissingEndpoints(result.missingEndpoints);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Analysis failed');
        setIsComplete(true);
        setMatchedEndpoints([]);
        setMissingEndpoints([]);
      } finally {
        setIsAnalyzing(false);
      }
    }, PICALLEX_CONFIG.ANALYSIS_DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [moduleId, description, endpoints, moduleLoading, moduleError, enabled]);

  return {
    isAnalyzing,
    isComplete,
    matchedEndpoints,
    missingEndpoints,
    error,
  };
}
