import { useSelector } from "react-redux";
import { Link } from "react-router";
import type { RootState } from "~/state/store";
import { useNavigate } from "react-router";
import { useAppDispatch } from "~/state/hooks";
import { clearCurrentUser } from "~/state/sessionSlice";

function UserNav() {
  const currentUser = useSelector(
    (state: RootState) => state.session.currentUser,
  );

  console.log("USER NAV CURRENT USER", currentUser);

  return (
    <nav className="user-nav">
      {!currentUser ? (
        <ul className="flex">
          <li className="pl-2 pr-2 content-center">
            <Link to="/signin">Login</Link>
          </li>
          <li className="pl-2 pr-2 content-center">
            <Link to="/signup">Register</Link>
          </li>
        </ul>
      ) : (
        <ul className="flex">
          <li className="pl-2 pr-2 content-center">
            <LogoutButton />
          </li>
          <li className="pl-2 pr-2 content-center">
            <Link to="/boards/new">New Board</Link>
          </li>
          <li className="pl-2 pr-2 content-center">
            <Link to="/users/edit" className="flex">
              <span className="pr-2 content-center">
                {currentUser.full_name}
              </span>
              <img
                src={`${import.meta.env.VITE_API_URL}/static/profile_pics/default.jpg`}
                alt="Profile Image"
                className="w-8"
              />
            </Link>
          </li>
        </ul>
      )}
    </nav>
  );
}

function LogoutButton() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  function logout() {
    localStorage.removeItem("jwt");
    dispatch(clearCurrentUser());
    navigate("/");
  }

  return <button onClick={logout}>Logout</button>;
}

export default UserNav;
