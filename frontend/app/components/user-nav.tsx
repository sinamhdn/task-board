import { Link, useLocation } from "react-router";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { GiHamburgerMenu } from "react-icons/gi";
import type { RootState } from "~/state/store";
import BoardAddButton from "./board-add-button";
import { useAddNewBoardForm } from "~/providers/board-add-provider";
import LogoutButton from "./logout-button";
import { useAppSelector } from "~/state/hooks";

function UserNav() {
  const currentUser = useAppSelector(
    (state: RootState) => state.session.currentUser,
  );
  const location = useLocation();
  const isHome = location.pathname === "/";
  const { showAddNewBoardForm, handleCancelAddNewBoardClick } =
    useAddNewBoardForm();

  return (
    <nav className="user-nav">
      <div className="user-nav-desktop hidden md:block">
        {!currentUser ? (
          <ul className="flex">
            <li className="p-2 m-2 rounded-sm content-center bg-gray-300 dark:bg-gray-700">
              <Link to="/signin">Login</Link>
            </li>
            <li className="p-2 m-2 rounded-sm content-center bg-gray-300 dark:bg-gray-700">
              <Link to="/signup">Register</Link>
            </li>
          </ul>
        ) : (
          <ul className="flex">
            <li className="p-2 m-2 rounded-sm content-center bg-gray-300 dark:bg-gray-700">
              <LogoutButton className="cursor-pointer" />
            </li>
            {isHome && (
              <li className="p-2 m-2 rounded-sm content-center bg-gray-300 dark:bg-gray-700">
                {showAddNewBoardForm ? (
                  <button
                    className="cursor-pointer w-full pt-2 pb-2"
                    onClick={handleCancelAddNewBoardClick}
                  >
                    Close Form
                  </button>
                ) : (
                  <BoardAddButton />
                )}
              </li>
            )}
            <li className="p-2 m-2 rounded-sm content-center bg-gray-300 dark:bg-gray-700">
              <Link to="/users/edit" className="flex">
                <span className="pr-2 content-center">
                  {currentUser.full_name}
                </span>
                {currentUser?.image_file ? (
                  <img
                    className="max-w-10 rounded-full"
                    src={`${import.meta.env.VITE_API_URL}/static/profile_pics/${currentUser.image_file}`}
                    alt="signed in user profile image."
                  />
                ) : (
                  <img
                    className="max-w-10 rounded-full"
                    src={`${import.meta.env.VITE_API_URL}/static/profile_pics/default.jpg`}
                    alt="signed in user profile image."
                  />
                )}
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
                  {currentUser?.image_file ? (
                    <img
                      className="max-w-10 rounded-full"
                      src={`${import.meta.env.VITE_API_URL}/static/profile_pics/${currentUser.image_file}`}
                      alt="signed in user profile image."
                    />
                  ) : (
                    <img
                      className="max-w-10 rounded-full"
                      src={`${import.meta.env.VITE_API_URL}/static/profile_pics/default.jpg`}
                      alt="signed in user profile image."
                    />
                  )}
                </Link>
              </MenuItem>
              <MenuItem>
                <div className="block w-full px-4 py-2 text-right">
                  {showAddNewBoardForm ? (
                    <button
                      className="cursor-pointer w-full pt-2 pb-2"
                      onClick={handleCancelAddNewBoardClick}
                    >
                      Close Form
                    </button>
                  ) : (
                    <BoardAddButton />
                  )}
                </div>
              </MenuItem>
              <MenuItem>
                <LogoutButton className="block w-full px-4 py-2 text-center cursor-pointer" />
              </MenuItem>
            </MenuItems>
          )}
        </Menu>
      </div>
    </nav>
  );
}

export default UserNav;
