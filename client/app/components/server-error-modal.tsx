import type { ErrorStateInterface } from "~/state";
import { clearError } from "~/state/errorSlice";
import { useAppDispatch } from "~/state/hooks";

function ServerErrorModal({
  showError,
  setShowError,
  errors,
}: {
  showError: boolean;
  setShowError: (state: boolean) => void;
  errors: ErrorStateInterface;
}) {
  const dispatch = useAppDispatch();
  return (
    <div className="server-error-modal">
      {showError && errors?.server_error && (
        <div className="main-error-toast fixed rounded-sm w-100 left-1/2 -translate-x-1/2 bottom-0 bg-red-800 text-white mb-2">
          <div className="error-message text-left">
            <button
              onClick={() => {
                setShowError(false);
                dispatch(clearError());
              }}
              style={{ background: "none", border: "none", cursor: "pointer" }}
              className="pl-1"
            >
              ✕
            </button>
            <p className="text-center p-5">{errors.server_error}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default ServerErrorModal;
