import { useCallback, useEffect, useState } from "react";
import { getDashboardInfo } from "../Helper/dashBoardHelper";
import { apiSetConfig, apiFetchConfig } from "../Helper/apiConfig";

const Dashboard = (props) => {
  const [escalas, setEscalas] = useState([]);

  const [facturas, setFacturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [escalaActual, setEscalaActual] = useState("A");
  const [montoTotalEscala, setMontoTotalEscala] = useState(0);
  const [montoProximaEscala, setMontoProximaEscala] = useState(0);
  const [totalFacturado, setTotalFacturado] = useState(0);
  const [totalesPorMes, setTotalesPorMes] = useState({});
  const [modo, setModo] = useState("anual");

  function handleModoChange(nuevoModo) {
    setModo(nuevoModo);
    apiSetConfig(nuevoModo);
  }

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
    const [config] = await apiFetchConfig();
    if (config?.modo) setModo(config.modo);
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
  }, [fetchInformation, modo]);
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
  const porcentaje =
    montoTotalEscala > 0
      ? Math.min((totalFacturado / montoTotalEscala) * 100, 100)
      : 0;

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <div className="flex rounded-lg border border-gray-300 overflow-hidden text-sm">
          <button
            onClick={() => handleModoChange("semestral")}
            className={`px-4 py-1.5 ${modo === "semestral" ? "bg-blue-600 text-white font-medium" : "bg-white text-gray-500"}`}
          >
            Semestral
          </button>
          <button
            onClick={() => handleModoChange("anual")}
            className={`px-4 py-1.5 ${modo === "anual" ? "bg-blue-600 text-white font-medium" : "bg-white text-gray-500"}`}
          >
            Anual
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <div className="flex items-baseline gap-3">
          <span className="text-5xl font-bold text-blue-600">
            {escalaActual}
          </span>
          <span className="text-gray-500 text-sm">Categoría actual</span>
        </div>

        <div>
          <div className="flex justify-between text-sm text-gray-500 mb-1">
            <span>
              Facturado:{" "}
              <span className="font-medium text-gray-800">
                $
                {totalFacturado.toLocaleString("es-AR", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </span>
            <span>
              Límite:{" "}
              <span className="font-medium text-gray-800">
                $
                {montoTotalEscala.toLocaleString("es-AR", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div
              className="h-4 rounded-full bg-blue-500 transition-all"
              style={{ width: `${porcentaje}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Resta{" "}
            <span className="font-medium text-gray-600">
              $
              {montoProximaEscala.toLocaleString("es-AR", {
                minimumFractionDigits: 2,
              })}
            </span>{" "}
            para la próxima categoría
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
