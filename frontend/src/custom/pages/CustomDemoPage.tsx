/**
 * JPBot Custom Extensions - Demo Page
 *
 * Pagina de ejemplo para features custom.
 */

import { HelloAlert } from '../components/HelloAlert';

export function CustomDemoPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white shadow-lg rounded-xl p-8 max-w-md w-full">
        <HelloAlert />
      </div>
    </div>
  );
}
