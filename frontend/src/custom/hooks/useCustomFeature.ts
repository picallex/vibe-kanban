/**
 * JPBot Custom Extensions - Custom Feature Hook
 *
 * Hook de ejemplo para features custom.
 */

import { useState, useCallback } from 'react';

export function useCustomFeature() {
  const [isEnabled, setIsEnabled] = useState(true);

  const toggle = useCallback(() => {
    setIsEnabled((prev) => !prev);
  }, []);

  return {
    isEnabled,
    toggle,
  };
}
