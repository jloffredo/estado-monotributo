import { Form, redirect } from "react-router-dom";

export async function nuevaFacturaAction({ request, params }) {
  // POST /api/facturas
  // Body: { tipo: "C"|"E", fecha: "YYYY-MM-DD", destinatario: string, monto: number }
  const method = request.method;
  const data = await request.formData();
  const facturaData = {
    tipo: data.get("tipo_factura"),
    fecha: data.get("fecha"),
    destinatario: data.get("destinatario"),
    monto: parseFloat(data.get("monto")),
  };
  const response = await fetch("/api/facturas", {
    method: method,
    body: JSON.stringify(facturaData),
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response || response.status === 422 || response.error) {
    return new Response.json({ errors: response.error });
  }
  return redirect(`/facturas`);
}

const inputClass =
  "w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

const NuevaFactura = () => {
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Nueva Factura</h1>
      <Form method="POST" className="bg-white rounded-lg shadow p-6 space-y-4">
        <div>
          <span className="block text-sm font-medium text-gray-700 mb-2">
            Tipo
          </span>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="radio"
                name="tipo_factura"
                id="tipo_factura_c"
                value="C"
                className="accent-blue-600"
              />
              Factura C
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="radio"
                name="tipo_factura"
                id="tipo_factura_e"
                value="E"
                className="accent-blue-600"
              />
              Factura E
            </label>
          </div>
        </div>

        <div>
          <label
            htmlFor="fecha"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Fecha
          </label>
          <input
            type="date"
            id="fecha"
            name="fecha"
            className={inputClass}
            max={today}
          />
        </div>

        <div>
          <label
            htmlFor="destinatario"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Destinatario
          </label>
          <input
            type="text"
            id="destinatario"
            name="destinatario"
            className={inputClass}
          />
        </div>

        <div>
          <label
            htmlFor="monto"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Monto
          </label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            id="monto"
            name="monto"
            className={inputClass}
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition-colors"
          >
            Cargar
          </button>
        </div>
      </Form>
    </div>
  );
};

export default NuevaFactura;
