import { Outlet } from "react-router";
import { useSelector } from "react-redux";
import Header from "./header";
import type { RootState } from "~/state/store";
import { LoadingStatus } from "~/state/sessionSlice";
import { useAppDispatch } from "~/state/hooks";
import { clearStatus } from "~/state/sessionSlice";

function MainLayout() {
  const dispatch = useAppDispatch();
  const sessionErrors = useSelector(
    (errors: RootState) => errors.session.errors,
  );
  dispatch(clearStatus());
  return (
    <div className="main-layout-component">
      <div className="main-error-toast fixed rounded-full">
        {sessionErrors?.server_error && (
          <div className="error-message" style={{ color: "red" }}>
            {sessionErrors.server_error}
          </div>
        )}
        <FormSubmissionState />
      </div>
      <Header />
      <Outlet />
    </div>
  );
}

function FormSubmissionState() {
  const loadingState = useSelector((state: RootState) => state.session.status);
  if (loadingState === LoadingStatus.fulfiled) {
    return (
      <div className="success-message" style={{ color: "green" }}>
        Form submitted succesufully.
      </div>
    );
  }

  if (loadingState === LoadingStatus.rejected) {
    return (
      <div className="fail-message" style={{ color: "red" }}>
        Form submission failed.
      </div>
    );
  }
}

export default MainLayout;
