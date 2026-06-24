import { useState, useEffect, useCallback } from "react";
import { apiFetchEscalas } from "../Helper/apiEscalas";

const EscalasMonotributo = () => {
  const [escalas, setEscalas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);

  const fetchEscalas = useCallback(async () => {
    let error = null;
    let escala = null;
    setLoading(true);
    setError(null);
    [escala, error] = await apiFetchEscalas();
    setLoading(false);
    if (escala) {
      setEscalas(escala);
    }
    if (error) setError(error);
  }, []);

  useEffect(() => {
    fetchEscalas();
  }, [fetchEscalas]);

  const sincronizar = () => {
    setSyncing(true);
    fetch("/api/escalas/sync", { method: "POST" })
      .then((res) => res.json())
      .then(() => fetchEscalas())
      .catch((err) => setError(err.message))
      .finally(() => setSyncing(false));
  };

  if (loading)
    return (
      <div className="flex justify-center items-center py-16">
        <span className="text-gray-500 text-lg">Cargando escalas...</span>
      </div>
    );

  if (error)
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        Error: {error}
      </div>
    );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Escalas Monotributo
        </h1>
        <button
          onClick={sincronizar}
          disabled={syncing}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors"
        >
          {syncing ? "Sincronizando..." : "Sincronizar con AFIP"}
        </button>
      </div>

      {escalas.length === 0 ? (
        <div className="text-center text-gray-500 py-12 bg-white rounded-lg border border-gray-200">
          Sin datos. Presioná "Sincronizar con AFIP".
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-600">
                  Categoría
                </th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600">
                  Facturación máx.
                </th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600">
                  Cuota
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {escalas.map((e) => (
                <tr
                  key={e.categoria}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {e.categoria}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">
                    {e.ingresos_brutos_anuales_max}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">
                    {e.cuota_total_locaciones_y_servicios}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default EscalasMonotributo;
