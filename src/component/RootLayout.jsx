import { Outlet } from "react-router-dom";
import Navegacion from "./Navegacion";

const RootLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navegacion />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default RootLayout;
