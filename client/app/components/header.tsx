import { TfiTrello } from "react-icons/tfi";
import { Link } from "react-router";
import ThemeSelector from "./theme-selector";
import UserNav from "./user-nav";

function Header() {
  return (
    <>
      <header className="header-component hidden xl:grid xl:grid-cols-3 items-center p-5 bg-gray-200 dark:bg-gray-800">
        <div className="header-main-logo justify-self-start">
          <Link
            to="/"
            className="flex bg-gray-300 dark:bg-gray-700 p-2 rounded"
          >
            <div>
              <TfiTrello className="w-4 h-4 md:w-8 md:h-8 text-black dark:text-white" />
            </div>
            <h1 className="app-title ml-2 mr-2 content-center font-title text-black dark:text-white">
              Task Board
            </h1>
          </Link>
        </div>
        <div className="header-theme-selector justify-self-center">
          <ThemeSelector />
        </div>
        <div className="header-user-nav justify-self-end text-black dark:text-white">
          <UserNav />
        </div>
      </header>
      <header className="header-component-mobile xl:hidden items-center p-5 bg-gray-200 dark:bg-gray-800">
        <div className="flex justify-between">
          <div className="header-main-logo justify-self-start">
            <Link
              to="/"
              className="flex p-2 rounded bg-gray-300 dark:bg-gray-700"
            >
              <div>
                <TfiTrello className="w-4 h-4 md:w-8 md:h-8 text-black dark:text-white" />
              </div>
              <h1 className="app-title ml-2 mr-2 content-center font-title text-black dark:text-white">
                Task Board
              </h1>
            </Link>
          </div>
          <div className="header-user-nav justify-self-end text-black dark:text-white">
            <UserNav />
          </div>
        </div>
        <div className="header-theme-selector justify-self-center">
          <ThemeSelector />
        </div>
      </header>
    </>
  );
}

export default Header;
