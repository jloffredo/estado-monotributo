import { apiFetchFacturas } from "./apiFacturas";
import { apiFetchEscalas } from "./apiEscalas";

export async function getDashboardInfo() {
  let facturas = null;
  let error = null;
  let escala = null;
  let totalFacturado = 0.0;
  let escalaActual = "A";
  let montoProximaEscala = 0.0;
  let montoTotalEscala = 0;
  [facturas, error] = await apiFetchFacturas();
  if (facturas) {
    [escala, error] = await apiFetchEscalas();
  }
  const escalasOrdenado = [...escala].sort(
    (a, b) => a.ingresos_brutos_anuales_max - b.ingresos_brutos_anuales_max,
  );
  const totalesPorMes = facturas?.reduce((acc, f) => {
    const key = f.fecha.slice(0, 7); // "YYYY-MM"
    acc[key] = (acc[key] ?? 0) + f.monto;
    return acc;
  }, {});

  // eslint-disable-next-line array-callback-return
  facturas?.map((factura) => {
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
  });
  return [
    facturas,
    escalasOrdenado,
    totalFacturado,
    escalaActual,
    montoTotalEscala,
    montoProximaEscala,
    totalesPorMes,
    error,
  ];
}
