/**
 * JPBot Custom Extensions - Configuration
 *
 * Configuration for Picallex API integration
 */

export const PICALLEX_CONFIG = {
  /**
   * Base URL for OpenAPI module files in S3
   * Can be overridden via environment variable
   */
  OPENAPI_BASE_URL:
    import.meta.env.VITE_PICALLEX_OPENAPI_URL || 'https://picallex-openapi.s3.amazonaws.com',

  /**
   * Enable/disable endpoint analysis feature
   */
  ENABLE_ENDPOINT_ANALYSIS: true,

  /**
   * Debounce time for endpoint analysis (ms)
   */
  ANALYSIS_DEBOUNCE_MS: 500,

  /**
   * Cache stale time for React Query (ms)
   */
  CACHE_STALE_TIME: 5 * 60 * 1000, // 5 minutes

  /**
   * Reference to picallex-manage CLAUDE.md for prompts
   */
  CLAUDE_MD_REFERENCE: 'CLAUDE.md',

  /**
   * Project name for prompt context
   */
  PROJECT_NAME: 'picallex-manage',

  /**
   * Framework info for prompt context
   */
  PROJECT_FRAMEWORK: 'Next.js 15 con backend Laravel',
} as const;

/**
 * Get the URL for a module's OpenAPI file
 */
export function getModuleUrl(moduleId: string): string {
  return `${PICALLEX_CONFIG.OPENAPI_BASE_URL}/modules/${moduleId}.json`;
}

/**
 * Get the URL for the metadata file
 */
export function getMetadataUrl(): string {
  return `${PICALLEX_CONFIG.OPENAPI_BASE_URL}/metadata.json`;
}
