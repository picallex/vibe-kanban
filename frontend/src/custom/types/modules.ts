/**
 * JPBot Custom Extensions - Picallex Module Types
 *
 * Defines the module structure for organizing API endpoints
 * to optimize token usage when generating prompts.
 */

export type PicallexModule =
  | 'paia-ai'
  | 'auditor'
  | 'dynamic-queues'
  | 'integrations'
  | 'infrastructure'
  | 'system';

export interface PicallexModuleInfo {
  id: PicallexModule;
  label: string;
  description: string;
  tags: string[];
  estimatedTokens: number;
}

/**
 * Module definitions mapping API tags to functional groups.
 * This reduces token usage from ~38k (full openapi) to ~3-6k per module.
 */
export const PICALLEX_MODULES: PicallexModuleInfo[] = [
  {
    id: 'paia-ai',
    label: 'PAIA & AI',
    description: 'Asistentes de IA, opciones, productos y generación de prompts',
    tags: ['AssistantOptions', 'AssistantProducts', 'CustomAssistants', 'GeneralAi', 'Paia'],
    estimatedTokens: 3500,
  },
  {
    id: 'auditor',
    label: 'Auditor',
    description: 'Auditoría de agentes, transcripciones y reportes',
    tags: ['Auditor', 'AgentAuditor'],
    estimatedTokens: 5500,
  },
  {
    id: 'dynamic-queues',
    label: 'Dynamic Queues',
    description: 'Colas dinámicas, reglas, turnos y prioridades',
    tags: ['DynamicQueues', 'DynamicQueuesChangelog'],
    estimatedTokens: 6000,
  },
  {
    id: 'integrations',
    label: 'Integrations',
    description: 'HubSpot, Salesforce, scheduling y campañas',
    tags: ['HubSpot', 'Schedules', 'Campana'],
    estimatedTokens: 5000,
  },
  {
    id: 'infrastructure',
    label: 'Infrastructure',
    description: 'PBX MyFlex, DIDs, media y productos',
    tags: ['MyflexPbx', 'Media', 'Products'],
    estimatedTokens: 3000,
  },
  {
    id: 'system',
    label: 'System',
    description: 'Endpoints de sistema, health checks y monitoring',
    tags: ['ApiCheck', 'HelpCenter', 'MonitoringPanel'],
    estimatedTokens: 2000,
  },
];

/**
 * Get module info by ID
 */
export function getModuleById(id: PicallexModule): PicallexModuleInfo | undefined {
  return PICALLEX_MODULES.find((m) => m.id === id);
}

/**
 * Get module by tag name
 */
export function getModuleByTag(tag: string): PicallexModuleInfo | undefined {
  return PICALLEX_MODULES.find((m) => m.tags.includes(tag));
}
