import { Outlet } from "react-router";
import { useSelector } from "react-redux";
import Header from "./header";
import type { RootState } from "~/state/store";
import { useAppDispatch } from "~/state/hooks";
import { clearStatus } from "~/state/sessionSlice";
import { clearError } from "~/state/errorSlice";
import { useEffect, useState } from "react";
import FormSubmissionStatusModal from "./form-submission-status-modal";
import ServerErrorModal from "./server-error-modal";

function MainLayout() {
  const dispatch = useAppDispatch();
  const errors = useSelector((state: RootState) => state.errors);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (errors?.server_error) {
      setShowError(true);
      const timer = setTimeout(() => {
        setShowError(false);
        dispatch(clearError());
        dispatch(clearStatus());
      }, 5000); // 5 seconds
      return () => clearTimeout(timer); // Cleanup timeout if component unmounts
    }
  }, [errors, dispatch]);

  return (
    <div className="main-layout-component">
      <Header />
      <FormSubmissionStatusModal />
      <ServerErrorModal
        showError={showError}
        setShowError={setShowError}
        errors={errors}
      />
      <Outlet />
    </div>
  );
}

export default MainLayout;
