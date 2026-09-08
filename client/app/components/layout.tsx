import { Outlet } from "react-router";
import Header from "./header";
import type { RootState } from "~/state/store";
import { useAppDispatch, useAppSelector } from "~/state/hooks";
import { clearSessionStatus } from "~/state/sessionSlice";
import { clearError } from "~/state/errorSlice";
import { useEffect, useState } from "react";
import FormSubmissionStatusModal from "./form-submission-status-modal";
import ServerErrorModal from "./server-error-modal";
import { getToken } from "~/utils/auth";
import { getCurrentUser } from "~/state/sessionSlice.ts";

function MainLayout() {
  const dispatch = useAppDispatch();
  const errors = useAppSelector((state: RootState) => state.errors);
  const [showError, setShowError] = useState(false);
  const currentUser = useAppSelector((state) => state.session.currentUser);
  const token = getToken();

  useEffect(() => {
    if (token && !currentUser) {
      dispatch(getCurrentUser(token));
    }
  }, [dispatch, token, currentUser]);

  useEffect(() => {
    if (errors?.server_error) {
      setShowError(true);
      const timer = setTimeout(() => {
        setShowError(false);
        dispatch(clearError());
        dispatch(clearSessionStatus());
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
