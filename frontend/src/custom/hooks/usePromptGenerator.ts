/**
 * JPBot Custom Extensions - Prompt Generator Hook
 *
 * Hook for generating enriched prompts with API context.
 */

import { useMemo } from 'react';
import { usePicallexModule } from './usePicallexModule';
import { buildPrompt, buildSimplePrompt, estimateTokens } from '../utils/promptBuilder';
import type { PicallexModule } from '../types/modules';

interface UsePromptGeneratorOptions {
  moduleId: PicallexModule | null;
  description: string;
}

interface UsePromptGeneratorReturn {
  /**
   * The enriched description with API context
   */
  enrichedDescription: string;

  /**
   * Whether the module data is loading
   */
  loading: boolean;

  /**
   * Error message if module fetch failed
   */
  error: string | null;

  /**
   * Estimated token count for the enriched prompt
   */
  estimatedTokens: number;

  /**
   * Whether a module is selected and loaded
   */
  hasModuleContext: boolean;
}

export function usePromptGenerator({
  moduleId,
  description,
}: UsePromptGeneratorOptions): UsePromptGeneratorReturn {
  const { endpoints, loading, error } = usePicallexModule({ moduleId });

  const enrichedDescription = useMemo(() => {
    // If no description, return empty
    if (!description.trim()) {
      return '';
    }

    // If no module selected or still loading, return simple prompt
    if (!moduleId || loading || error) {
      return buildSimplePrompt(description);
    }

    // If no endpoints loaded yet, return simple prompt
    if (endpoints.length === 0) {
      return buildSimplePrompt(description);
    }

    // Build enriched prompt with module endpoints
    return buildPrompt(moduleId, endpoints, description);
  }, [moduleId, description, endpoints, loading, error]);

  const estimatedTokens = useMemo(() => {
    return estimateTokens(enrichedDescription);
  }, [enrichedDescription]);

  return {
    enrichedDescription,
    loading,
    error,
    estimatedTokens,
    hasModuleContext: !!moduleId && endpoints.length > 0 && !loading && !error,
  };
}
