import { formatARS } from "../Helper/formatHelper";

const Factura = ({ mes,total }) => {
  return <div>
    <span> {mes}</span>
    <span> {formatARS(total)}</span>
  </div>;
};

export default Factura;