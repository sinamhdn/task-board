import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { GiHamburgerMenu } from "react-icons/gi";
import { Link, useLocation } from "react-router";
import { useAddNewBoardForm } from "~/providers/board-add-provider";
import { useAppSelector } from "~/state/hooks";
import type { RootState } from "~/state/store";
import BoardAddButton from "./boards/board-add-button";
import LogoutButton from "./logout-button";

function UserNav() {
  const currentUser = useAppSelector(
    (state: RootState) => state.sessionSlice.currentUser,
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
                <span className="ml-2 content-center w-24">
                  <p className="truncate group-hover:animate-scroll-left">
                    {currentUser.full_name}
                  </p>
                </span>
                {currentUser?.image_file ? (
                  <img
                    className="max-w-10 rounded-full"
                    src={`/api/v1/static/profile_pics/${currentUser.image_file}`}
                    alt="signed in user profile image."
                  />
                ) : (
                  <img
                    className="max-w-10 rounded-full"
                    src={`/api/v1/static/profile_pics/default.jpg`}
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
            <div className="p-2 rounded bg-gray-300 dark:bg-gray-700">
              <GiHamburgerMenu className="w-6 h-6 md;w-6 md:h-6" />
            </div>
          </MenuButton>
          {!currentUser ? (
            <MenuItems
              anchor="bottom start"
              className="w-full mt-14 bg-gray-200 dark:bg-gray-800 text-black dark:text-white shadow-lg z-10 py-10"
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
              anchor="bottom start"
              className="w-full mt-14 bg-gray-200 dark:bg-gray-800 text-black dark:text-white shadow-lg z-10 py-10"
            >
              <MenuItem>
                <Link
                  to="/users/edit"
                  className="flex justify-center px-4 py-2"
                >
                  {currentUser?.image_file ? (
                    <img
                      className="max-w-10 rounded-full"
                      src={`/api/v1/static/profile_pics/${currentUser.image_file}`}
                      alt="signed in user profile image."
                    />
                  ) : (
                    <img
                      className="max-w-10 rounded-full"
                      src={`/api/v1/static/profile_pics/default.jpg`}
                      alt="signed in user profile image."
                    />
                  )}
                  <span className="ml-2 content-center w-24">
                    <p className="truncate group-hover:animate-scroll-left">
                      {currentUser.full_name}
                    </p>
                  </span>
                </Link>
              </MenuItem>
              {/* {isHome && (
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
              )} */}
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
