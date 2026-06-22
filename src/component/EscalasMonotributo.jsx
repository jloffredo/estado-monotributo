import { useState, useEffect, useCallback } from "react";

const EscalasMonotributo = () => {
  const [escalas, setEscalas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);

  const fetchEscalas = useCallback(() => {
    setLoading(true);
    setError(null);
    fetch("/api/escalas")
      .then((res) => {
        if (!res.ok) throw new Error(`Error ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setEscalas(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
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

  if (loading) return <div>Cargando escalas...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <button onClick={sincronizar} disabled={syncing}>
        {syncing ? "Sincronizando..." : "Sincronizar con AFIP"}
      </button>
      {escalas.length === 0 ? (
        <div>Sin datos. Presioná "Sincronizar con AFIP".</div>
      ) : (
        escalas.map((e) => (
          <div key={e.categoria}>
            <div>Categoría: {e.categoria}</div>
            <div>Facturación máx: {e.ingresos_brutos_anuales_max}</div>
            <div>Cuota: {e.cuota_total_locaciones_y_servicios}</div>
          </div>
        ))
      )}
    </div>
  );
};

export default EscalasMonotributo;
