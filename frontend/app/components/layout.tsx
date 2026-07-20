import { Outlet } from "react-router";
import Header from "./header";

function MainLayout() {
  return (
    <div className="main-layout-component">
      <Header />
      <Outlet />
    </div>
  );
}

export default MainLayout;
