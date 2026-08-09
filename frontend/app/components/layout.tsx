import { Outlet } from "react-router";
import { useSelector } from "react-redux";
import Header from "./header";
import type { RootState } from "~/state/store";
import { LoadingStatus } from "~/state/sessionSlice";
import { useAppDispatch } from "~/state/hooks";
import { clearStatus } from "~/state/sessionSlice";
import { clearError, type ErrorState } from "~/state/errorSlice";
import { useEffect, useState } from "react";

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
      {showError && errors?.server_error && (
        <div className="main-error-toast fixed rounded-sm w-100 left-1/2 -translate-x-1/2 bottom-0 p-5 bg-red-800 text-white mb-2">
          <div className="error-message text-center">
            <button
              onClick={() => {
                setShowError(false);
                dispatch(clearError());
              }}
              style={{ background: "none", border: "none", cursor: "pointer" }}
            >
              ✕
            </button>
            <p>{errors.server_error}</p>
          </div>
        </div>
      )}
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
      <div className="success-message m-5 bg-green-500 text-white p-1 flex max-w-100 h-20 items-center absolute rounded-sm">
        <button
          onClick={() => {
            setFormSubmitState("");
            dispatch(clearError());
            dispatch(clearStatus());
          }}
          className="mr-5 pl-1 self-start"
          style={{ background: "none", border: "none", cursor: "pointer" }}
        >
          ✕
        </button>
        <p className="text-center pl-3 pr-3">Form submitted succesufully.</p>
      </div>
    );
  }

  if (formSubmitState === "rejected") {
    return (
      <div className="fail-message m-5 bg-red-500 text-white p-1 flex max-w-100 h-20 items-center absolute rounded-sm">
        <button
          onClick={() => {
            setFormSubmitState("");
            dispatch(clearError());
            dispatch(clearStatus());
          }}
          className="mr-5 pl-1 self-start"
          style={{ background: "none", border: "none", cursor: "pointer" }}
        >
          ✕
        </button>
        <p className="text-center pl-3 pr-3">Form submission failed.</p>
      </div>
    );
  }

  return null;
}

export default MainLayout;
