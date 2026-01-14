/**
 * JPBot Custom Extensions - Prompt Builder
 *
 * Builds enriched prompts with API context for Claude Code.
 */

import { PICALLEX_CONFIG } from '../config';
import { getModuleById, type PicallexModule } from '../types/modules';
import type { OpenApiEndpoint } from '../types/openapi';

/**
 * Format an endpoint for display in the prompt
 */
function formatEndpoint(endpoint: OpenApiEndpoint): string {
  const lines: string[] = [];

  // Method and path
  lines.push(`**${endpoint.method} ${endpoint.path}**`);

  // Operation ID
  if (endpoint.operationId) {
    lines.push(`- operationId: \`${endpoint.operationId}\``);
  }

  // Summary/Description
  if (endpoint.summary) {
    lines.push(`- ${endpoint.summary}`);
  }

  // Parameters
  if (endpoint.parameters && endpoint.parameters.length > 0) {
    const params = endpoint.parameters
      .map((p) => {
        const required = p.required ? ' (required)' : '';
        return `\`${p.name}\` (${p.in})${required}`;
      })
      .join(', ');
    lines.push(`- Params: ${params}`);
  }

  // Request body indicator
  if (endpoint.requestBody) {
    lines.push(`- Has request body: yes`);
  }

  return lines.join('\n');
}

/**
 * Build the full enriched prompt
 */
export function buildPrompt(
  moduleId: PicallexModule,
  endpoints: OpenApiEndpoint[],
  userDescription: string
): string {
  const module = getModuleById(moduleId);
  const moduleName = module?.label ?? moduleId;

  const endpointsList = endpoints.map(formatEndpoint).join('\n\n');

  const prompt = `## Contexto del Proyecto

Este proyecto es **${PICALLEX_CONFIG.PROJECT_NAME}**, una aplicación ${PICALLEX_CONFIG.PROJECT_FRAMEWORK}.

Para instrucciones detalladas de desarrollo, consulta \`${PICALLEX_CONFIG.CLAUDE_MD_REFERENCE}\` en la raíz del proyecto.

## API Disponible - Módulo: ${moduleName}

Los siguientes endpoints están disponibles para implementar esta funcionalidad:

### Endpoints

${endpointsList}

---

## Tarea Solicitada

${userDescription}

---

## Notas Importantes

- Proxy API: todas las llamadas al backend Laravel deben pasar por \`/pages/api/\`
- Auth: utiliza \`callLaravel\` de \`@/lib/auth\` para llamadas autenticadas
- i18n: sigue las convenciones de internacionalización del proyecto
- Dark mode: respeta el contexto de tema del módulo correspondiente
`;

  return prompt.trim();
}

/**
 * Build a simple prompt without API context
 */
export function buildSimplePrompt(userDescription: string): string {
  return `## Contexto del Proyecto

Este proyecto es **${PICALLEX_CONFIG.PROJECT_NAME}**, una aplicación ${PICALLEX_CONFIG.PROJECT_FRAMEWORK}.

Para instrucciones detalladas de desarrollo, consulta \`${PICALLEX_CONFIG.CLAUDE_MD_REFERENCE}\` en la raíz del proyecto.

---

## Tarea Solicitada

${userDescription}

---

## Notas Importantes

- Proxy API: todas las llamadas al backend Laravel deben pasar por \`/pages/api/\`
- Auth: utiliza \`callLaravel\` de \`@/lib/auth\` para llamadas autenticadas
- i18n: sigue las convenciones de internacionalización del proyecto
- Dark mode: respeta el contexto de tema del módulo correspondiente
`.trim();
}

/**
 * Estimate token count for a string (rough approximation)
 * Uses ~4 chars per token as a rough estimate
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}
