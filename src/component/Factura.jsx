import { formatARS } from "../Helper/formatHelper";

const Factura = ({ factura }) => {
  return <div>
    <span> {factura.tipo}</span>
    <span> {factura.fecha}</span>
    <span> {factura.destinatario}</span>
    <span> {formatARS(factura.monto)}</span>
  </div>;
};

export default Factura;