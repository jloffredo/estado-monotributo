import { NavLink } from "react-router-dom";

const Navegacion = () => {
  return (
    <header className="">
      <nav>
        <ul className="">
          <li>
            <NavLink
              to="/"
              className={({ isActive }) => (isActive ? "active" : undefined)}
              end
            >
              Home
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/facturas"
              className={({ isActive }) => (isActive ? "active" : undefined)}
            >
              Facturas
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/facturas/nueva"
              className={({ isActive }) => (isActive ? "active" : undefined)}
            >
              Nueva Factura
            </NavLink>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Navegacion;