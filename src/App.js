import "./App.css";
import EscalasMonotributo from "./component/EscalasMonotributo";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import RootLayout from "./component/RootLayout";
import Facturacion from "./component/Facturacion";
import NuevaFactura, { nuevaFacturaAction } from "./component/NuevaFactura";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { id: "escalas", index: true, element: <EscalasMonotributo /> },
      {
        id: "facturas",
        path: "facturas",
        children: [
          { id: "lista", index: true, element: <Facturacion /> },
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
