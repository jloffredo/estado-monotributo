import { formatARS } from "../Helper/formatHelper";

const TIPO_LABEL = { C: "Factura C", E: "Factura E" };

const Factura = ({ factura }) => {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-600">
          {TIPO_LABEL[factura.tipo] ?? factura.tipo}
        </span>
        <div>
          <p className="text-sm font-medium text-gray-800">
            {factura.destinatario}
          </p>
          <p className="text-xs text-gray-400">{factura.fecha}</p>
        </div>
      </div>
      <span className="text-sm font-semibold text-gray-800">
        {formatARS(factura.monto)}
      </span>
    </div>
  );
};

export default Factura;
