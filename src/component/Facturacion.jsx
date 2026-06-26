import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Factura from "./Factura";
import FacturaMensual from "./FacturaMensual";
import { getDashboardInfo } from "../Helper/dashBoardHelper";
import { formatARS } from "../Helper/formatHelper";

const Facturacion = () => {
  const [escalas, setEscalas] = useState([]);

  const [facturas, setFacturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [escalaActual, setEscalaActual] = useState("A");
  const [montoTotalEscala, setMontoTotalEscala] = useState(0);
  const [montoProximaEscala, setMontoProximaEscala] = useState(0);
  const [totalFacturado, setTotalFacturado] = useState(0);
  const [totalesPorMes, setTotalesPorMes] = useState({});

  const fetchInformation = useCallback(async () => {
    let facturas = null;
    let error = null;
    let escalasOrdenado = null;
    let escalaActualTmp = "A";
    let montoProximaEscalaTmp = 0.0;
    let montoTotalEscalaTmp = 0;
    let totalFacturadoTmp = 0;
    let totalesPorMesTmp = null;
    setLoading(true);
    setError(null);
    [
      facturas,
      escalasOrdenado,
      totalFacturadoTmp,
      escalaActualTmp,
      montoTotalEscalaTmp,
      montoProximaEscalaTmp,
      totalesPorMesTmp,
      error,
    ] = await getDashboardInfo();
    setLoading(false);
    if (error) setError(error);
    setFacturas(facturas);
    setEscalas(escalasOrdenado);
    setTotalFacturado(totalFacturadoTmp);
    setEscalaActual(escalaActualTmp);
    setMontoTotalEscala(montoTotalEscalaTmp);
    setMontoProximaEscala(montoProximaEscalaTmp);
    setTotalesPorMes(totalesPorMesTmp);
  }, []);

  useEffect(() => {
    fetchInformation();
  }, [fetchInformation]);

  let mostrarFacturas = facturas?.map((factura) => {
    return <Factura key={factura.id} factura={factura} />;
  });
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
          <div>
            {Object.entries(totalesPorMes).map(([mes, totalMensual]) => {
              return (
                <FacturaMensual key={mes} mes={mes} total={totalMensual} />
              );
            })}
          </div>
          <div className="mt-4 bg-white rounded-lg shadow p-6 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Total facturado</span>
              <span className="text-lg font-bold text-gray-800">
                {formatARS(totalFacturado)}
              </span>
            </div>
            <div className="flex justify-between items-center border-t border-gray-100 pt-3">
              <span className="text-sm text-gray-500">Categoría actual</span>
              <span className="font-semibold text-gray-800">
                {escalaActual} — {formatARS(montoTotalEscala)}
              </span>
            </div>
            <div className="flex justify-between items-center border-t border-gray-100 pt-3">
              <span className="text-sm text-gray-500">
                Resta para próxima categoría
              </span>
              <span className="font-semibold text-blue-600">
                {formatARS(montoProximaEscala)}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Facturacion;
