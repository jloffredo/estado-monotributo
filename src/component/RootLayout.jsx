import {Outlet} from "react-router-dom";
import Navegacion from "./Navegacion";

const RootLayout = (props) => {
    return (
        <>
            <Navegacion />
            <main>
                <Outlet/>
            </main>
        </>
    );
};

export default RootLayout;