import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetchFacturas } from "../Helper/apiFacturas";
import { apiFetchEscalas } from "../Helper/apiEscalas";

const Facturacion = () => {
  const [escalas, setEscalas] = useState([]);

  const [facturas, setFacturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  let totalFacturado = 0.0;
  let escalaActual = "A";
  let montoProximaEscala = 0.0;
  let montoTotalProximaEscala = 0;
  let montoTotalEscala = 0;
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

  const fetchFacturas = useCallback(async () => {
    let facturas = null;
    let error = null;
    setLoading(true);
    setError(null);
    [facturas, error] = await apiFetchFacturas();
    setLoading(false);
    if (error) setError(error);
    if (facturas) {
      await fetchEscalas();
      setFacturas(facturas);
    }
  }, [fetchEscalas]);

  useEffect(() => {
    fetchFacturas();
  }, [fetchFacturas]);
  const escalasOrdenado = [...escalas].sort(
    (a, b) => a.ingresos_brutos_anuales_max - b.ingresos_brutos_anuales_max,
  );
  if (loading)
    return (
      <div className="flex justify-center items-center py-16">
        <span className="text-gray-500 text-lg">Cargando Facturas...</span>
      </div>
    );

  if (error)
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        Error: {error}
      </div>
    );
  const totalesPorMes = facturas.reduce((acc, f) => {
    const key = f.fecha.slice(0, 7); // "YYYY-MM"
    acc[key] = (acc[key] ?? 0) + f.monto;
    return acc;
  }, {});
  let mostrarFacturas = '';
  facturas.map((factura) => {
      totalFacturado += factura.monto;
      let escalaActualIndex = escalasOrdenado.findIndex(
        (e) => e.ingresos_brutos_anuales_max >= totalFacturado,
      );
      escalaActual = escalasOrdenado[escalaActualIndex]?.categoria;
      montoTotalEscala =
        escalasOrdenado[escalaActualIndex]?.ingresos_brutos_anuales_max;
      montoProximaEscala = montoTotalEscala
        ? montoTotalEscala - totalFacturado
        : 0.0;
      mostrarFacturas+= JSON.stringify(factura);
    });
  return (
    <>
      {facturas?.length === 0 ? (
        <div className="text-center text-gray-500 py-12 bg-white rounded-lg border border-gray-200">
          Sin Facturas aún. Carga nuevas <Link to="/facturas/nueva">acá</Link>
        </div>
      ) : (
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Facturación</h1>
          <div className="bg-white rounded-lg shadow p-6 text-gray-500">
            {mostrarFacturas}
          </div>
          <div> {JSON.stringify(totalesPorMes)}</div>
          <div> Total Facturado: {totalFacturado.toFixed(2)}</div>
          <div>
            Escala Actual: {escalaActual} - Monto: {montoTotalEscala.toFixed(2)}
          </div>
          <div> Monto para proxima escala: {montoProximaEscala.toFixed(2)}</div>
        </div>
      )}
    </>
  );
};

export default Facturacion;
