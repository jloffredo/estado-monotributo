import "./App.css";
import EscalasMonotributo from "./component/EscalasMonotributo";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import RootLayout from "./component/RootLayout";
import Facturacion from "./component/Facturacion";
import NuevaFactura, { nuevaFacturaAction } from "./component/NuevaFactura";
import Dashboard from "./component/Dashboard";
import ImportadorFacturas from "./component/ImportadorFacturas";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { id: "dashboard", index: true, element: <Dashboard /> },
      { id: "escalas", path: "escalas", element: <EscalasMonotributo /> },
      {
        id: "facturas",
        path: "facturas",
        children: [
          { id: "lista", index: true, element: <Facturacion /> },
          {
            id: "importador",
            path: "importador",
            element: <ImportadorFacturas />,
          },
          {
            id: "nuevaFacturaForm",
            path: "nueva",
            element: <NuevaFactura />,
            action: nuevaFacturaAction,
          },
        ],
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
