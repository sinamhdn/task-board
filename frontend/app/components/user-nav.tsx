import { useSelector } from "react-redux";
import { Link } from "react-router";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { GiHamburgerMenu } from "react-icons/gi";
import type { RootState } from "~/state/store";
import { useNavigate } from "react-router";
import { useAppDispatch } from "~/state/hooks";
import { clearCurrentUser } from "~/state/sessionSlice";
import { useEffect } from "react";
import { removeToken } from "~/utils/auth";

function UserNav() {
  const currentUser = useSelector(
    (state: RootState) => state.session.currentUser,
  );
  const navigate = useNavigate();

  console.log("USER NAV CURRENT USER", currentUser);

  useEffect(() => {
    if (!currentUser) removeToken();
    navigate("/signin", { replace: true });
  }, []);

  return (
    <nav className="user-nav">
      <div className="user-nav-desktop hidden md:block">
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
                  className="h-auto w-8 max-w-full rounded-full"
                />
              </Link>
            </li>
          </ul>
        )}
      </div>
      <div className="user-nav-mobile block md:hidden">
        <Menu as="div" className="relative">
          <MenuButton>
            <GiHamburgerMenu className="w-6 h-6 md;w-6 md:h-6" />
          </MenuButton>
          {!currentUser ? (
            <MenuItems
              anchor="bottom end"
              className="mt-2 w-56 rounded-md dark:bg-gray-700 bg-gray-300 text-black dark:text-white shadow-lg border-black dark:border-white border-2"
            >
              <MenuItem>
                <Link
                  to="/signin"
                  className="block w-full px-4 py-2 text-right"
                >
                  Login
                </Link>
              </MenuItem>
              <MenuItem>
                <Link
                  to="/signup"
                  className="block w-full px-4 py-2 text-right"
                >
                  Register
                </Link>
              </MenuItem>
            </MenuItems>
          ) : (
            <MenuItems
              anchor="bottom end"
              className="mt-2 w-56 rounded-md dark:bg-gray-700 bg-gray-300 text-black dark:text-white shadow-lg border-black dark:border-white border-2"
            >
              <MenuItem>
                <Link to="/users/edit" className="flex justify-end px-4 py-2">
                  <span className="pr-2 content-center">
                    {currentUser.full_name}
                  </span>
                  <img
                    src={`${import.meta.env.VITE_API_URL}/static/profile_pics/default.jpg`}
                    alt="Profile Image"
                    className="h-auto w-8 max-w-full rounded-full"
                  />
                </Link>
              </MenuItem>
              <MenuItem>
                <Link
                  to="/boards/new"
                  className="block w-full px-4 py-2 text-right"
                >
                  New Board
                </Link>
              </MenuItem>
              <MenuItem>
                <LogoutButton className="block w-full px-4 py-2 text-right" />
              </MenuItem>
            </MenuItems>
          )}
        </Menu>
      </div>
    </nav>
  );
}

function LogoutButton({ className }: { className?: string }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  function logout() {
    localStorage.removeItem("jwt");
    dispatch(clearCurrentUser());
    navigate("/");
  }

  return (
    <button onClick={logout} className={className}>
      Logout
    </button>
  );
}

export default UserNav;
