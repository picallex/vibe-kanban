/**
 * JPBot Custom Extensions - Endpoint Alert Component
 *
 * Displays a warning when missing endpoints are detected.
 * Provides copy-to-clipboard functionality for Jira task creation.
 */

import { useState } from 'react';
import { AlertTriangle, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import type { MissingEndpointInfo } from '../types/openapi';

interface EndpointAlertProps {
  missingEndpoints: MissingEndpointInfo[];
}

export function EndpointAlert({ missingEndpoints }: EndpointAlertProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [expanded, setExpanded] = useState(false);

  if (missingEndpoints.length === 0) {
    return null;
  }

  const handleCopy = async (jiraDescription: string, index: number) => {
    try {
      await navigator.clipboard.writeText(jiraDescription);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const firstEndpoint = missingEndpoints[0];
  const hasMultiple = missingEndpoints.length > 1;

  return (
    <Alert className="border-yellow-500/50 bg-yellow-500/10">
      <AlertTriangle className="h-4 w-4 text-yellow-500" />
      <AlertTitle className="text-yellow-600 dark:text-yellow-400">
        Endpoint(s) no encontrado(s)
      </AlertTitle>
      <AlertDescription className="mt-2 space-y-3">
        <p className="text-sm text-muted-foreground">
          La descripción sugiere funcionalidades que requieren endpoints que no existen
          actualmente en la API. Puedes crear la tarea de todas formas, pero considera
          crear tickets en Jira para los endpoints faltantes.
        </p>

        {/* First endpoint (always visible) */}
        <div className="flex items-center justify-between gap-2 p-2 bg-background/50 rounded border">
          <div className="flex-1 min-w-0">
            <span className="font-mono text-xs">
              {firstEndpoint.suggestedMethod} {firstEndpoint.suggestedPath}
            </span>
            <p className="text-xs text-muted-foreground truncate">
              {firstEndpoint.description}
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleCopy(firstEndpoint.jiraDescription, 0)}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-yellow-500/20 hover:bg-yellow-500/30 rounded transition-colors"
            title="Copiar descripción para Jira"
          >
            {copiedIndex === 0 ? (
              <>
                <Check className="h-3 w-3" />
                Copiado
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                Copiar
              </>
            )}
          </button>
        </div>

        {/* Multiple endpoints toggle */}
        {hasMultiple && (
          <>
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {expanded ? (
                <>
                  <ChevronUp className="h-3 w-3" />
                  Ocultar {missingEndpoints.length - 1} más
                </>
              ) : (
                <>
                  <ChevronDown className="h-3 w-3" />
                  Ver {missingEndpoints.length - 1} más
                </>
              )}
            </button>

            {/* Additional endpoints (collapsible) */}
            {expanded && (
              <div className="space-y-2">
                {missingEndpoints.slice(1).map((endpoint, idx) => (
                  <div
                    key={idx + 1}
                    className="flex items-center justify-between gap-2 p-2 bg-background/50 rounded border"
                  >
                    <div className="flex-1 min-w-0">
                      <span className="font-mono text-xs">
                        {endpoint.suggestedMethod} {endpoint.suggestedPath}
                      </span>
                      <p className="text-xs text-muted-foreground truncate">
                        {endpoint.description}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(endpoint.jiraDescription, idx + 1)}
                      className="flex items-center gap-1 px-2 py-1 text-xs bg-yellow-500/20 hover:bg-yellow-500/30 rounded transition-colors"
                      title="Copiar descripción para Jira"
                    >
                      {copiedIndex === idx + 1 ? (
                        <>
                          <Check className="h-3 w-3" />
                          Copiado
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          Copiar
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </AlertDescription>
    </Alert>
  );
}
