import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { LoadingStatusEnum } from "~/state";
import { clearError } from "~/state/error-slice";
import { useAppDispatch } from "~/state/hooks";
import { clearSessionStatus } from "~/state/session-slice";
import type { RootState } from "~/state/store";

function FormSubmissionStatusModal() {
  const [formSubmitState, setFormSubmitState] = useState("");
  const dispatch = useAppDispatch();
  const authLoadingStatus = useSelector(
    (state: RootState) => state.sessionSlice.authStatus,
  );

  useEffect(() => {
    if (authLoadingStatus === LoadingStatusEnum.fulfilled) {
      setFormSubmitState("fulfilled");
      const timer = setTimeout(() => {
        setFormSubmitState("");
        dispatch(clearError());
        dispatch(clearSessionStatus());
      }, 5000); // 5 seconds
      return () => clearTimeout(timer); // Cleanup timeout if componeauthLoadingStatusnt unmounts
    }

    if (authLoadingStatus === LoadingStatusEnum.rejected) {
      setFormSubmitState("rejected");
      const timer = setTimeout(() => {
        setFormSubmitState("");
        dispatch(clearError());
        dispatch(clearSessionStatus());
      }, 5000); // 5 seconds
      return () => clearTimeout(timer); // Cleanup timeout if component unmounts
    }

    return;
  }, [authLoadingStatus, dispatch]);

  if (formSubmitState === "fulfilled") {
    return (
      <div className="success-message m-5 bg-green-500 text-white p-1 flex max-w-100 h-20 items-center absolute rounded-sm z-100">
        <button
          onClick={() => {
            setFormSubmitState("");
            dispatch(clearError());
            dispatch(clearSessionStatus());
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
            dispatch(clearSessionStatus());
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
