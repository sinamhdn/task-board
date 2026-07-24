import { Outlet } from "react-router";
import { useSelector } from "react-redux";
import type { RootState } from "~/state/store";
import Header from "./header";

function MainLayout() {
  const sessionErrors = useSelector(
    (errors: RootState) => errors.session.errors,
  );
  return (
    <div className="main-layout-component">
      {sessionErrors.server_error && (
        <div className="error-message" style={{ color: "red" }}>
          {sessionErrors.server_error}
        </div>
      )}
      <Header />
      <Outlet />
    </div>
  );
}

export default MainLayout;
