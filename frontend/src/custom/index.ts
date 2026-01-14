/**
 * JPBot Custom Extensions
 *
 * Barrel export for all custom extensions.
 * Import from '@/custom' to use.
 */

// Legacy Types (Task Assignee)
export type { TaskAssignee, SetTaskAssignee, TaskAssigneeInfo } from './types';

// Picallex Types
export type {
  PicallexModule,
  PicallexModuleInfo,
} from './types/modules';
export { PICALLEX_MODULES, getModuleById, getModuleByTag } from './types/modules';

export type {
  HttpMethod,
  OpenApiParameter,
  OpenApiEndpoint,
  ModuleOpenApiResponse,
  OpenApiMetadata,
  MissingEndpointInfo,
  EndpointAnalysisResult,
} from './types/openapi';

// Config
export { PICALLEX_CONFIG, getModuleUrl, getMetadataUrl } from './config';

// Components
export { HelloAlert } from './components/HelloAlert';
export { ModuleSelector } from './components/ModuleSelector';
export { EndpointAlert } from './components/EndpointAlert';

// Pages
export { CustomDemoPage } from './pages/CustomDemoPage';

// Hooks
export { useCustomFeature } from './hooks/useCustomFeature';
export { useTaskAssignee, assigneeApi } from './hooks/useTaskAssignee';
export { usePicallexModule, clearModuleCache } from './hooks/usePicallexModule';
export { usePromptGenerator } from './hooks/usePromptGenerator';
export { useEndpointAnalyzer } from './hooks/useEndpointAnalyzer';

// Utils
export { buildPrompt, buildSimplePrompt, estimateTokens } from './utils/promptBuilder';
export { analyzeDescription } from './utils/endpointMatcher';

// Routes
export { customRoutes } from './routes';
