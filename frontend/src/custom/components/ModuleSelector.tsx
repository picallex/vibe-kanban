/**
 * JPBot Custom Extensions - Module Selector Component
 *
 * Dropdown for selecting Picallex API modules.
 * Shows module name, description, and estimated token count.
 */

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PICALLEX_MODULES, type PicallexModule } from '../types/modules';

interface ModuleSelectorProps {
  value: PicallexModule | null;
  onChange: (value: PicallexModule | null) => void;
  disabled?: boolean;
  placeholder?: string;
}

/**
 * Format token count for display (e.g., 3500 -> "~3.5k")
 */
function formatTokens(tokens: number): string {
  if (tokens >= 1000) {
    return `~${(tokens / 1000).toFixed(1)}k`;
  }
  return `~${tokens}`;
}

export function ModuleSelector({
  value,
  onChange,
  disabled = false,
  placeholder = 'Selecciona un módulo de API...',
}: ModuleSelectorProps) {
  const handleChange = (newValue: string) => {
    if (newValue === '__none__') {
      onChange(null);
    } else {
      onChange(newValue as PicallexModule);
    }
  };

  const selectedModule = value
    ? PICALLEX_MODULES.find((m) => m.id === value)
    : null;

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm text-muted-foreground">
        Módulo API (para enriquecer prompt)
      </label>
      <Select
        value={value ?? '__none__'}
        onValueChange={handleChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder}>
            {selectedModule ? (
              <span className="flex items-center gap-2">
                <span>{selectedModule.label}</span>
                <span className="text-xs text-muted-foreground">
                  ({formatTokens(selectedModule.estimatedTokens)} tokens)
                </span>
              </span>
            ) : (
              placeholder
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__none__">
            <span className="text-muted-foreground">Sin módulo (prompt simple)</span>
          </SelectItem>
          {PICALLEX_MODULES.map((module) => (
            <SelectItem key={module.id} value={module.id}>
              <div className="flex flex-col py-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{module.label}</span>
                  <span className="text-xs text-muted-foreground">
                    ({formatTokens(module.estimatedTokens)} tokens)
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {module.description}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
