/**
 * JPBot Custom Extensions - Endpoint Matcher
 *
 * Analyzes user descriptions to detect if required endpoints exist.
 */

import type { OpenApiEndpoint, MissingEndpointInfo, HttpMethod } from '../types/openapi';

/**
 * Action words mapped to HTTP methods
 */
const ACTION_METHOD_MAP: Record<string, HttpMethod[]> = {
  // Create actions -> POST
  crear: ['POST'],
  agregar: ['POST'],
  añadir: ['POST'],
  nuevo: ['POST'],
  nueva: ['POST'],
  registrar: ['POST'],
  generar: ['POST'],
  create: ['POST'],
  add: ['POST'],
  new: ['POST'],
  register: ['POST'],
  generate: ['POST'],

  // Read actions -> GET
  obtener: ['GET'],
  listar: ['GET'],
  ver: ['GET'],
  mostrar: ['GET'],
  buscar: ['GET'],
  consultar: ['GET'],
  get: ['GET'],
  list: ['GET'],
  view: ['GET'],
  show: ['GET'],
  search: ['GET'],
  fetch: ['GET'],
  find: ['GET'],

  // Update actions -> PUT/PATCH
  actualizar: ['PUT', 'PATCH'],
  modificar: ['PUT', 'PATCH'],
  editar: ['PUT', 'PATCH'],
  cambiar: ['PUT', 'PATCH'],
  update: ['PUT', 'PATCH'],
  modify: ['PUT', 'PATCH'],
  edit: ['PUT', 'PATCH'],
  change: ['PUT', 'PATCH'],

  // Delete actions -> DELETE
  eliminar: ['DELETE'],
  borrar: ['DELETE'],
  quitar: ['DELETE'],
  remover: ['DELETE'],
  delete: ['DELETE'],
  remove: ['DELETE'],
};

/**
 * Common entity names and their typical paths
 */
const ENTITY_PATH_MAP: Record<string, string[]> = {
  // Entities
  usuario: ['users', 'user'],
  usuarios: ['users'],
  user: ['users', 'user'],
  users: ['users'],

  lead: ['leads', 'lead'],
  leads: ['leads'],

  cliente: ['clients', 'customers', 'client'],
  clientes: ['clients', 'customers'],
  client: ['clients', 'client'],
  clients: ['clients'],
  customer: ['customers', 'customer'],
  customers: ['customers'],

  cola: ['queues', 'queue'],
  colas: ['queues'],
  queue: ['queues', 'queue'],
  queues: ['queues'],

  agente: ['agents', 'agent'],
  agentes: ['agents'],
  agent: ['agents', 'agent'],
  agents: ['agents'],

  auditoría: ['audits', 'auditor'],
  auditoria: ['audits', 'auditor'],
  audit: ['audits', 'audit'],
  audits: ['audits'],

  reporte: ['reports', 'report'],
  reportes: ['reports'],
  report: ['reports', 'report'],
  reports: ['reports'],

  campaña: ['campaigns', 'campaign', 'campana'],
  campana: ['campaigns', 'campaign', 'campana'],
  campaign: ['campaigns', 'campaign'],
  campaigns: ['campaigns'],

  producto: ['products', 'product'],
  productos: ['products'],
  product: ['products', 'product'],
  products: ['products'],

  asistente: ['assistants', 'assistant'],
  asistentes: ['assistants'],
  assistant: ['assistants', 'assistant'],
  assistants: ['assistants'],

  transcripción: ['transcriptions', 'transcription'],
  transcripcion: ['transcriptions', 'transcription'],
  transcription: ['transcriptions', 'transcription'],
  transcriptions: ['transcriptions'],

  configuración: ['settings', 'config', 'options'],
  configuracion: ['settings', 'config', 'options'],
  settings: ['settings'],
  config: ['config'],
  options: ['options'],
};

/**
 * Extract action words from description
 */
function extractActions(description: string): { word: string; methods: HttpMethod[] }[] {
  const words = description.toLowerCase().split(/\s+/);
  const actions: { word: string; methods: HttpMethod[] }[] = [];

  for (const word of words) {
    const cleanWord = word.replace(/[^a-záéíóúñ]/gi, '');
    if (ACTION_METHOD_MAP[cleanWord]) {
      actions.push({ word: cleanWord, methods: ACTION_METHOD_MAP[cleanWord] });
    }
  }

  return actions;
}

/**
 * Extract entity names from description
 */
function extractEntities(description: string): { word: string; paths: string[] }[] {
  const words = description.toLowerCase().split(/\s+/);
  const entities: { word: string; paths: string[] }[] = [];

  for (const word of words) {
    const cleanWord = word.replace(/[^a-záéíóúñ]/gi, '');
    if (ENTITY_PATH_MAP[cleanWord]) {
      entities.push({ word: cleanWord, paths: ENTITY_PATH_MAP[cleanWord] });
    }
  }

  return entities;
}

/**
 * Check if an endpoint matches a method and entity
 */
function endpointMatches(
  endpoint: OpenApiEndpoint,
  methods: HttpMethod[],
  entityPaths: string[]
): boolean {
  // Check method
  if (!methods.includes(endpoint.method)) {
    return false;
  }

  // Check if path contains any of the entity paths
  const pathLower = endpoint.path.toLowerCase();
  return entityPaths.some((entityPath) => pathLower.includes(entityPath));
}

/**
 * Generate Jira description for a missing endpoint
 */
function generateJiraDescription(
  action: string,
  entity: string,
  method: HttpMethod,
  suggestedPath: string
): string {
  return `## Endpoint Requerido

**Método:** ${method}
**Path sugerido:** ${suggestedPath}

## Descripción

Se requiere un endpoint para ${action} ${entity}.

## Contexto

Este endpoint es necesario para completar una tarea de desarrollo en jpbot.
Se detectó que la funcionalidad descrita requiere un endpoint que no existe
actualmente en la API de picallex-manage.

## Especificaciones Sugeridas

- Request Body: Por definir según requerimientos
- Response: Por definir según requerimientos
- Autenticación: Bearer Token (estándar)

---
*Generado automáticamente por JPBot*`;
}

/**
 * Analyze a description against available endpoints
 */
export function analyzeDescription(
  description: string,
  availableEndpoints: OpenApiEndpoint[]
): {
  isComplete: boolean;
  matchedEndpoints: OpenApiEndpoint[];
  missingEndpoints: MissingEndpointInfo[];
} {
  const actions = extractActions(description);
  const entities = extractEntities(description);

  // If no clear actions or entities detected, assume complete
  if (actions.length === 0 || entities.length === 0) {
    return {
      isComplete: true,
      matchedEndpoints: [],
      missingEndpoints: [],
    };
  }

  const matchedEndpoints: OpenApiEndpoint[] = [];
  const missingEndpoints: MissingEndpointInfo[] = [];
  const checkedCombinations = new Set<string>();

  // Check each action-entity combination
  for (const action of actions) {
    for (const entity of entities) {
      const combinationKey = `${action.methods[0]}-${entity.paths[0]}`;
      if (checkedCombinations.has(combinationKey)) {
        continue;
      }
      checkedCombinations.add(combinationKey);

      // Find matching endpoint
      const matchingEndpoint = availableEndpoints.find((ep) =>
        endpointMatches(ep, action.methods, entity.paths)
      );

      if (matchingEndpoint) {
        if (!matchedEndpoints.includes(matchingEndpoint)) {
          matchedEndpoints.push(matchingEndpoint);
        }
      } else {
        // Suggest the most likely method and path
        const suggestedMethod = action.methods[0];
        const suggestedPath = `/${entity.paths[0]}`;

        missingEndpoints.push({
          description: `Endpoint para ${action.word} ${entity.word}`,
          suggestedMethod,
          suggestedPath,
          reason: `No se encontró endpoint ${suggestedMethod} para ${entity.word}`,
          jiraDescription: generateJiraDescription(
            action.word,
            entity.word,
            suggestedMethod,
            suggestedPath
          ),
        });
      }
    }
  }

  return {
    isComplete: missingEndpoints.length === 0,
    matchedEndpoints,
    missingEndpoints,
  };
}
