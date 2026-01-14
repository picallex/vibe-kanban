#!/usr/bin/env node
/**
 * Script para generar archivos de API optimizados desde openapi.json
 *
 * Genera:
 * 1. api-index.json - Índice compacto (~300 tokens)
 * 2. modules/*.json - Archivos detallados por módulo (~2-4k tokens c/u)
 *
 * Fuentes (en orden de prioridad):
 * 1. S3 bucket (si está configurado y disponible)
 * 2. Archivo local (fallback)
 *
 * Uso:
 *   node scripts/generate-api-modules.js [options]
 *
 * Opciones:
 *   --s3-url <url>       URL de S3 donde buscar openapi.json (default: env PICALLEX_OPENAPI_S3_URL)
 *   --local <path>       Path local al openapi.json (default: ../picallex-manage/openapi.json)
 *   --output <dir>       Directorio de salida (default: ./api-modules)
 *   --force-local        Ignorar S3 y usar solo archivo local
 *   --force-s3           Fallar si S3 no está disponible
 *
 * Ejemplos:
 *   node scripts/generate-api-modules.js
 *   node scripts/generate-api-modules.js --force-local
 *   node scripts/generate-api-modules.js --s3-url https://mybucket.s3.amazonaws.com/openapi.json
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Definición de módulos (debe coincidir con frontend/src/custom/types/modules.ts)
const MODULE_DEFINITIONS = [
  {
    id: 'paia-ai',
    label: 'PAIA & AI',
    tags: ['AssistantOptions', 'AssistantProducts', 'CustomAssistants', 'GeneralAi', 'Paia'],
  },
  {
    id: 'auditor',
    label: 'Auditor',
    tags: ['Auditor', 'AgentAuditor'],
  },
  {
    id: 'dynamic-queues',
    label: 'Dynamic Queues',
    tags: ['DynamicQueues', 'DynamicQueuesChangelog'],
  },
  {
    id: 'integrations',
    label: 'Integrations',
    tags: ['HubSpot', 'Schedules', 'Campana'],
  },
  {
    id: 'infrastructure',
    label: 'Infrastructure',
    tags: ['MyflexPbx', 'Media', 'Products'],
  },
  {
    id: 'system',
    label: 'System',
    tags: ['ApiCheck', 'HelpCenter', 'MonitoringPanel'],
  },
];

// Configuración por defecto
const DEFAULT_CONFIG = {
  s3Url: process.env.PICALLEX_OPENAPI_S3_URL || 'https://picallex-openapi.s3.amazonaws.com/openapi.json',
  localPath: '../picallex-manage/openapi.json',
  outputDir: './api-modules',
  forceLocal: false,
  forceS3: false,
};

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const config = { ...DEFAULT_CONFIG };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--s3-url':
        config.s3Url = args[++i];
        break;
      case '--local':
        config.localPath = args[++i];
        break;
      case '--output':
        config.outputDir = args[++i];
        break;
      case '--force-local':
        config.forceLocal = true;
        break;
      case '--force-s3':
        config.forceS3 = true;
        break;
      case '--help':
        console.log(`
Uso: node scripts/generate-api-modules.js [options]

Opciones:
  --s3-url <url>       URL de S3 donde buscar openapi.json
  --local <path>       Path local al openapi.json
  --output <dir>       Directorio de salida
  --force-local        Ignorar S3 y usar solo archivo local
  --force-s3           Fallar si S3 no está disponible
  --help               Mostrar esta ayuda
        `);
        process.exit(0);
    }
  }

  return config;
}

/**
 * Fetch JSON from URL
 */
function fetchJson(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;

    const request = client.get(url, { timeout: 10000 }, (response) => {
      // Handle redirects
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        return fetchJson(response.headers.location).then(resolve).catch(reject);
      }

      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
        return;
      }

      let data = '';
      response.on('data', (chunk) => (data += chunk));
      response.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`Invalid JSON: ${e.message}`));
        }
      });
    });

    request.on('error', reject);
    request.on('timeout', () => {
      request.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

/**
 * Read JSON from local file
 */
function readLocalJson(filePath) {
  const absolutePath = path.resolve(process.cwd(), filePath);
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Archivo no encontrado: ${absolutePath}`);
  }
  const content = fs.readFileSync(absolutePath, 'utf-8');
  return JSON.parse(content);
}

/**
 * Get OpenAPI spec from S3 or local file
 */
async function getOpenApiSpec(config) {
  // Force local
  if (config.forceLocal) {
    console.log('📂 Usando archivo local (--force-local)');
    return { spec: readLocalJson(config.localPath), source: 'local' };
  }

  // Try S3 first
  if (config.s3Url) {
    console.log(`🌐 Intentando descargar desde S3: ${config.s3Url}`);
    try {
      const spec = await fetchJson(config.s3Url);
      console.log('✅ OpenAPI descargado desde S3');
      return { spec, source: 's3' };
    } catch (err) {
      console.log(`⚠️  S3 no disponible: ${err.message}`);

      if (config.forceS3) {
        throw new Error('S3 no disponible y --force-s3 está activo');
      }
    }
  }

  // Fallback to local
  console.log(`📂 Usando archivo local: ${config.localPath}`);
  try {
    const spec = readLocalJson(config.localPath);
    return { spec, source: 'local' };
  } catch (err) {
    throw new Error(`No se pudo obtener openapi.json ni de S3 ni local: ${err.message}`);
  }
}

/**
 * Estima tokens (aproximación: ~4 chars por token)
 */
function estimateTokens(obj) {
  const str = JSON.stringify(obj);
  return Math.ceil(str.length / 4);
}

/**
 * Extrae el nombre del schema de una referencia
 */
function extractSchemaName(ref) {
  if (!ref) return undefined;
  const parts = ref.split('/');
  return parts[parts.length - 1];
}

/**
 * Extrae endpoints del OpenAPI spec
 */
function extractEndpoints(spec) {
  const endpoints = [];

  for (const [pathStr, pathItem] of Object.entries(spec.paths || {})) {
    for (const [method, operation] of Object.entries(pathItem)) {
      if (['get', 'post', 'put', 'delete', 'patch'].includes(method.toLowerCase())) {
        const op = operation;

        const endpoint = {
          operationId: op.operationId || `${method}_${pathStr}`,
          method: method.toUpperCase(),
          path: pathStr,
          summary: op.summary,
          tags: op.tags,
        };

        // Solo incluir descripción si es diferente del summary
        if (op.description && op.description !== op.summary) {
          endpoint.description = op.description.slice(0, 200);
        }

        // Parámetros simplificados
        if (op.parameters && op.parameters.length > 0) {
          endpoint.parameters = op.parameters.map((p) => ({
            name: p.name,
            in: p.in,
            required: p.required,
            type: p.schema?.type,
          }));
        }

        // Request body simplificado
        if (op.requestBody) {
          const content = op.requestBody.content;
          const jsonContent = content?.['application/json'];
          endpoint.requestBody = {
            required: op.requestBody.required,
            schemaRef: extractSchemaName(jsonContent?.schema?.$ref),
          };
        }

        endpoints.push(endpoint);
      }
    }
  }

  return endpoints;
}

/**
 * Genera el índice compacto
 */
function generateIndex(endpoints, version, source) {
  const compactEndpoints = endpoints.map((e) => {
    const compact = {
      m: e.method,
      p: e.path,
    };
    if (e.summary) compact.s = e.summary;
    if (e.tags && e.tags.length > 0) compact.t = e.tags;
    if (e.operationId) compact.o = e.operationId;
    return compact;
  });

  const moduleStats = MODULE_DEFINITIONS.map((mod) => {
    const count = endpoints.filter(
      (e) => e.tags && e.tags.some((t) => mod.tags.includes(t))
    ).length;
    return {
      id: mod.id,
      label: mod.label,
      endpointCount: count,
      tags: mod.tags,
    };
  });

  return {
    version,
    source,
    generatedAt: new Date().toISOString(),
    totalEndpoints: endpoints.length,
    modules: moduleStats,
    endpoints: compactEndpoints,
  };
}

/**
 * Genera archivo por módulo
 */
function generateModule(moduleId, endpoints, version) {
  const moduleDef = MODULE_DEFINITIONS.find((m) => m.id === moduleId);
  if (!moduleDef) {
    throw new Error(`Module ${moduleId} not found`);
  }

  const moduleEndpoints = endpoints.filter(
    (e) => e.tags && e.tags.some((t) => moduleDef.tags.includes(t))
  );

  const output = {
    module: moduleId,
    label: moduleDef.label,
    version,
    generatedAt: new Date().toISOString(),
    endpoints: moduleEndpoints,
    tokenCount: 0,
  };

  output.tokenCount = estimateTokens(output);

  return output;
}

/**
 * Genera índice en formato Markdown
 */
function generateMarkdownIndex(endpoints, version, source) {
  let md = `# API Index - v${version}\n\n`;
  md += `Source: ${source}\n`;
  md += `Generated: ${new Date().toISOString()}\n\n`;
  md += `Total endpoints: ${endpoints.length}\n\n`;

  for (const mod of MODULE_DEFINITIONS) {
    const moduleEndpoints = endpoints.filter(
      (e) => e.tags && e.tags.some((t) => mod.tags.includes(t))
    );

    if (moduleEndpoints.length === 0) continue;

    md += `## ${mod.label}\n\n`;
    md += `| Method | Path | Summary |\n`;
    md += `|--------|------|--------|\n`;

    for (const ep of moduleEndpoints) {
      const summary = ep.summary ? ep.summary.replace(/\|/g, '\\|') : '-';
      md += `| ${ep.method} | \`${ep.path}\` | ${summary} |\n`;
    }
    md += '\n';
  }

  const unassigned = endpoints.filter((e) => {
    if (!e.tags || e.tags.length === 0) return true;
    return !MODULE_DEFINITIONS.some((m) => e.tags.some((t) => m.tags.includes(t)));
  });

  if (unassigned.length > 0) {
    md += `## Sin módulo asignado\n\n`;
    md += `| Method | Path | Tags | Summary |\n`;
    md += `|--------|------|------|--------|\n`;

    for (const ep of unassigned) {
      const summary = ep.summary ? ep.summary.replace(/\|/g, '\\|') : '-';
      const tags = ep.tags ? ep.tags.join(', ') : '-';
      md += `| ${ep.method} | \`${ep.path}\` | ${tags} | ${summary} |\n`;
    }
    md += '\n';
  }

  return md;
}

/**
 * Main
 */
async function main() {
  const config = parseArgs();

  console.log('🚀 Generando módulos de API...\n');

  // Obtener spec
  const { spec, source } = await getOpenApiSpec(config);
  console.log(`✅ OpenAPI ${spec.openapi} - ${spec.info.title} v${spec.info.version}`);

  // Extraer endpoints
  const endpoints = extractEndpoints(spec);
  console.log(`📊 Total endpoints encontrados: ${endpoints.length}`);

  // Crear directorios
  const outputPath = path.resolve(process.cwd(), config.outputDir);
  const modulesPath = path.join(outputPath, 'modules');

  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
  }
  if (!fs.existsSync(modulesPath)) {
    fs.mkdirSync(modulesPath, { recursive: true });
  }

  // Generar índice
  const index = generateIndex(endpoints, spec.info.version, source);
  const indexPath = path.join(outputPath, 'api-index.json');
  fs.writeFileSync(indexPath, JSON.stringify(index, null, 2));
  console.log(`📄 Índice generado: api-index.json (~${estimateTokens(index)} tokens)`);

  // Generar módulos
  let totalModuleTokens = 0;
  for (const moduleDef of MODULE_DEFINITIONS) {
    const moduleOutput = generateModule(moduleDef.id, endpoints, spec.info.version);
    const moduleFilePath = path.join(modulesPath, `${moduleDef.id}.json`);
    fs.writeFileSync(moduleFilePath, JSON.stringify(moduleOutput, null, 2));
    console.log(
      `📦 ${moduleDef.label}: ${moduleOutput.endpoints.length} endpoints (~${moduleOutput.tokenCount} tokens)`
    );
    totalModuleTokens += moduleOutput.tokenCount;
  }

  // Generar metadata.json
  const metadata = {
    version: spec.info.version,
    source,
    generatedAt: new Date().toISOString(),
    modules: MODULE_DEFINITIONS.map((m) => {
      const mod = generateModule(m.id, endpoints, spec.info.version);
      return {
        id: m.id,
        file: `modules/${m.id}.json`,
        endpointCount: mod.endpoints.length,
        tokenCount: mod.tokenCount,
      };
    }),
  };
  const metadataPath = path.join(outputPath, 'metadata.json');
  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

  // Generar markdown
  const markdownIndex = generateMarkdownIndex(endpoints, spec.info.version, source);
  const markdownPath = path.join(outputPath, 'API-INDEX.md');
  fs.writeFileSync(markdownPath, markdownIndex);

  console.log('\n📊 Resumen:');
  console.log(`   - Fuente: ${source}`);
  console.log(`   - Índice JSON: ~${estimateTokens(index)} tokens`);
  console.log(`   - Módulos (total): ~${totalModuleTokens} tokens`);
  console.log(`   - OpenAPI original: ~${estimateTokens(spec)} tokens`);
  console.log(
    `   - Ahorro con índice: ${Math.round((1 - estimateTokens(index) / estimateTokens(spec)) * 100)}%`
  );

  console.log('\n✅ Archivos generados en:', outputPath);
}

main().catch((err) => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
