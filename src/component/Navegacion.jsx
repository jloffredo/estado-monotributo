import { NavLink } from "react-router-dom";

const linkClass = ({ isActive }) =>
  isActive
    ? "text-blue-400 font-semibold border-b-2 border-blue-400 pb-1"
    : "text-gray-300 hover:text-white transition-colors";

const Navegacion = () => {
  return (
    <header className="bg-gray-800 text-white shadow-md">
      <nav className="max-w-5xl mx-auto px-4 py-3">
        <div className="flex gap-6 list-none">
          <span>
            <NavLink to="/" className={linkClass} end>
              Dashboard
            </NavLink>
          </span>
          <span>
            <NavLink to="/escalas" className={linkClass} end>
              Escalas Monotributo
            </NavLink>
          </span>
          <span>
            <NavLink to="/facturas" end className={linkClass}>
              Facturas
            </NavLink>
          </span>
          <span>
            <NavLink to="/facturas/importador" end className={linkClass}>
              Importar CSV
            </NavLink>
          </span>
          <span>
            <NavLink to="/facturas/nueva" className={linkClass}>
              Nueva Factura
            </NavLink>
          </span>
        </div>
      </nav>
    </header>
  );
};

export default Navegacion;
