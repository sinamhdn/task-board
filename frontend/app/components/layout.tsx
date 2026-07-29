import { Outlet } from "react-router";
import { useSelector } from "react-redux";
import Header from "./header";
import type { RootState } from "~/state/store";
import { LoadingStatus } from "~/state/sessionSlice";
import { useAppDispatch } from "~/state/hooks";
import { clearStatus, clearError } from "~/state/sessionSlice";
import { useEffect, useState } from "react";

function MainLayout() {
  const dispatch = useAppDispatch();
  const sessionErrors = useSelector(
    (errors: RootState) => errors.session.errors,
  );
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (sessionErrors?.server_error) {
      setShowError(true);
      const timer = setTimeout(() => {
        setShowError(false);
        dispatch(clearError());
        dispatch(clearStatus());
      }, 5000); // 5 seconds
      return () => clearTimeout(timer); // Cleanup timeout if component unmounts
    }
  }, [sessionErrors, dispatch]);

  return (
    <div className="main-layout-component">
      <Header />
      <div className="main-error-toast fixed rounded-full">
        {showError && sessionErrors?.server_error && (
          <div className="error-message" style={{ color: "red" }}>
            {sessionErrors.server_error}
            <button
              onClick={() => {
                setShowError(false);
                dispatch(clearError());
              }}
              style={{ background: "none", border: "none", cursor: "pointer" }}
            >
              ✕
            </button>
          </div>
        )}
      </div>
      <FormSubmissionState />
      <Outlet />
    </div>
  );
}

function FormSubmissionState() {
  const [formSubmitState, setFormSubmitState] = useState("");
  const dispatch = useAppDispatch();
  const loadingState = useSelector(
    (state: RootState) => state.session.authStatus,
  );

  useEffect(() => {
    if (loadingState === LoadingStatus.fulfilled) {
      setFormSubmitState("fulfilled");
      const timer = setTimeout(() => {
        setFormSubmitState("");
        dispatch(clearError());
        dispatch(clearStatus());
      }, 5000); // 5 seconds
      return () => clearTimeout(timer); // Cleanup timeout if component unmounts
    }

    if (loadingState === LoadingStatus.rejected) {
      setFormSubmitState("rejected");
      const timer = setTimeout(() => {
        setFormSubmitState("");
        dispatch(clearError());
        dispatch(clearStatus());
      }, 5000); // 5 seconds
      return () => clearTimeout(timer); // Cleanup timeout if component unmounts
    }

    return;
  }, [loadingState, dispatch]);

  if (formSubmitState === "fulfilled") {
    return (
      <div className="success-message" style={{ color: "green" }}>
        <p>Form submitted succesufully.</p>
        <button
          onClick={() => {
            setFormSubmitState("");
            dispatch(clearError());
            dispatch(clearStatus());
          }}
          style={{ background: "none", border: "none", cursor: "pointer" }}
        >
          ✕
        </button>
      </div>
    );
  }

  if (formSubmitState === "rejected") {
    return (
      <div className="fail-message" style={{ color: "red" }}>
        <p>Form submission failed.</p>
        <button
          onClick={() => {
            setFormSubmitState("");
            dispatch(clearError());
            dispatch(clearStatus());
          }}
          style={{ background: "none", border: "none", cursor: "pointer" }}
        >
          ✕
        </button>
      </div>
    );
  }

  return null;
}

export default MainLayout;
