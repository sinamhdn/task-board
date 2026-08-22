import { useAppDispatch } from "~/state/hooks";
import { useNavigate } from "react-router";
import { removeToken } from "~/utils/auth";
import { clearCurrentUser } from "~/state/sessionSlice";

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
