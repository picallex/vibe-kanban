/**
 * JPBot Custom Extensions - Hello Alert Component
 *
 * Este componente muestra un alert con "Hola" al hacer click.
 * Es un ejemplo de como agregar customizaciones sin afectar el upstream.
 */

import { useState } from 'react';

interface HelloResponse {
  message: string;
  feature_enabled: boolean;
}

export function HelloAlert() {
  const [response, setResponse] = useState<HelloResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/custom/hello');
      if (res.ok) {
        const data: HelloResponse = await res.json();
        setResponse(data);
        alert(data.message);
      } else {
        // Feature not enabled (404)
        alert('Hola! (Feature backend no habilitado)');
      }
    } catch {
      alert('Hola! (Sin conexion al backend)');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-2xl font-bold">JPBot Custom Feature</h1>
      <p className="text-gray-600">
        Este es un ejemplo de feature custom que no afecta el upstream.
      </p>
      <button
        onClick={handleClick}
        disabled={loading}
        className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors"
      >
        {loading ? 'Cargando...' : 'Decir Hola'}
      </button>
      {response && (
        <div className="mt-4 p-4 bg-green-100 rounded-lg">
          <p>Backend respondio: {response.message}</p>
          <p>Feature enabled: {response.feature_enabled ? 'Si' : 'No'}</p>
        </div>
      )}
    </div>
  );
}
