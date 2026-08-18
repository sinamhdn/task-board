import type { ErrorState } from "~/state/errorSlice";

function ServerErrorModal({
  showError,
  errors,
}: {
  showError: boolean;
  errors: ErrorState;
}) {
  return (
    <div className="server-error-modal">
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
    </div>
  );
}

export default ServerErrorModal;
