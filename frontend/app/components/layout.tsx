import { Outlet } from "react-router";
import Header from "./header";
import type { RootState } from "~/state/store";
import { useAppDispatch, useAppSelector } from "~/state/hooks";
import { clearStatus, setCurrentUser } from "~/state/sessionSlice";
import { clearError } from "~/state/errorSlice";
import { useEffect, useState } from "react";
import FormSubmissionStatusModal from "./form-submission-status-modal";
import ServerErrorModal from "./server-error-modal";
import { getToken } from "~/utils";
import { fetchCurrentUser, removeToken } from "~/utils/auth";

function MainLayout() {
  const dispatch = useAppDispatch();
  const errors = useAppSelector((state: RootState) => state.errors);
  const currentUser = useAppSelector((state) => state.session.currentUser);
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

  useEffect(() => {
    const token = getToken();
    if (token && !currentUser) {
      fetchCurrentUser(token)
        .then((user) => dispatch(setCurrentUser(user)))
        .catch(() => removeToken()); // token invalid – clear it
    }
  }, [dispatch, currentUser]);

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
