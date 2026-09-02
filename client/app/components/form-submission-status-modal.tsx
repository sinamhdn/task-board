import { LoadingStatus } from "~/state/sessionSlice";
import { useSelector } from "react-redux";
import type { RootState } from "~/state/store";
import { useAppDispatch } from "~/state/hooks";
import { clearStatus } from "~/state/sessionSlice";
import { clearError } from "~/state/errorSlice";
import { useEffect, useState } from "react";

function FormSubmissionStatusModal() {
  const [formSubmitState, setFormSubmitState] = useState("");
  const dispatch = useAppDispatch();
  const authLoadingStatus = useSelector(
    (state: RootState) => state.session.authStatus,
  );

  useEffect(() => {
    if (authLoadingStatus === LoadingStatus.fulfilled) {
      setFormSubmitState("fulfilled");
      const timer = setTimeout(() => {
        setFormSubmitState("");
        dispatch(clearError());
        dispatch(clearStatus());
      }, 5000); // 5 seconds
      return () => clearTimeout(timer); // Cleanup timeout if componeauthLoadingStatusnt unmounts
    }

    if (authLoadingStatus === LoadingStatus.rejected) {
      setFormSubmitState("rejected");
      const timer = setTimeout(() => {
        setFormSubmitState("");
        dispatch(clearError());
        dispatch(clearStatus());
      }, 5000); // 5 seconds
      return () => clearTimeout(timer); // Cleanup timeout if component unmounts
    }

    return;
  }, [authLoadingStatus, dispatch]);

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

export default FormSubmissionStatusModal;
