import { useNavigate } from "react-router";
import { useAppDispatch } from "~/state/hooks";
import { clearCurrentUser } from "~/state/sessionSlice";
import { removeToken } from "~/utils/auth";

function LogoutButton({ className }: { className?: string }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  function logout() {
    removeToken();
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
