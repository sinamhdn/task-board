import { TfiTrello } from "react-icons/tfi";
import ThemeSelector from "./theme-selector";
import UserNav from "./user-nav";
import { Link } from "react-router";

function Header() {
  return (
    <header className="header-component grid grid-cols-3 items-center p-5 bg-gray-200 dark:bg-gray-800">
      <div className="header-main-logo justify-self-start">
        <Link to="/" className="flex bg-gray-300 dark:bg-gray-700 p-2 rounded">
          <TfiTrello className="w-6 h-6 md:w-8 md:h-8 text-black dark:text-white" />
          <h1 className="app-title ml-2 mr-2 content-center text-black dark:text-white">
            Trello Clone
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
  );
}

export default Header;
