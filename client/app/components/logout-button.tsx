import { useNavigate } from "react-router";
import { useAppDispatch } from "~/state/hooks";
import { clearCurrentUser } from "~/state/session-slice";
import { removeTokenCookie } from "~/utils/auth";

function LogoutButton({ className }: { className?: string }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  function logout() {
    removeTokenCookie();
    dispatch(clearCurrentUser());
    navigate("/");
  }

  return (
    <button onClick={logout} className={className}>
      Logout
    </button>
  );
}

export default LogoutButton;
