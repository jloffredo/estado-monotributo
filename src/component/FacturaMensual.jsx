import { formatARS } from "../Helper/formatHelper";

const FacturaMensual = ({ mes, total }) => {
  return (
    <div className="flex items-center justify-between px-4 py-2 rounded-lg bg-gray-50 border border-gray-100">
      <span className="text-sm font-medium text-gray-600 capitalize">
        {mes}
      </span>
      <span className="text-sm font-semibold text-gray-800">
        {formatARS(total)}
      </span>
    </div>
  );
};

export default FacturaMensual;
