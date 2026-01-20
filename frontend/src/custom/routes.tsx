/**
 * JPBot Custom Extensions - Routes
 *
 * Rutas custom que se agregan al router principal.
 * Estas rutas no afectan el upstream.
 */

import { Route } from 'react-router-dom';
import { CustomDemoPage } from './pages/CustomDemoPage';

/**
 * Custom routes to be added to the main router.
 * Import this in App.tsx and add inside <SentryRoutes>
 */
export const customRoutes = (
  <>
    <Route path="/custom" element={<CustomDemoPage />} />
    <Route path="/custom/demo" element={<CustomDemoPage />} />
  </>
);
