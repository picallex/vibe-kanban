/**
 * JPBot Custom Extensions - OpenAPI Types
 *
 * Types for consuming OpenAPI specification from S3
 */

import type { PicallexModule } from './modules';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface OpenApiParameter {
  name: string;
  in: 'path' | 'query' | 'header' | 'cookie';
  required?: boolean;
  description?: string;
  schema?: {
    type?: string;
    format?: string;
    enum?: string[];
  };
}

export interface OpenApiEndpoint {
  operationId: string;
  method: HttpMethod;
  path: string;
  summary?: string;
  description?: string;
  tags?: string[];
  parameters?: OpenApiParameter[];
  requestBody?: {
    required?: boolean;
    content?: Record<string, { schema?: unknown }>;
  };
  responses?: Record<string, unknown>;
}

/**
 * Response from module endpoint JSON files in S3
 */
export interface ModuleOpenApiResponse {
  module: PicallexModule;
  version: string;
  generatedAt: string;
  endpoints: OpenApiEndpoint[];
  schemas?: Record<string, unknown>;
  tokenCount: number;
}

/**
 * Metadata file structure (metadata.json in S3)
 */
export interface OpenApiMetadata {
  version: string;
  generatedAt: string;
  modules: {
    id: PicallexModule;
    file: string;
    endpointCount: number;
    tokenCount: number;
  }[];
}

/**
 * Missing endpoint info for Jira task creation
 */
export interface MissingEndpointInfo {
  description: string;
  suggestedMethod: HttpMethod;
  suggestedPath: string;
  reason: string;
  jiraDescription: string;
}

/**
 * Result of endpoint analysis
 */
export interface EndpointAnalysisResult {
  isComplete: boolean;
  matchedEndpoints: OpenApiEndpoint[];
  missingEndpoints: MissingEndpointInfo[];
  suggestions: string[];
}
