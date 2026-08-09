import { TfiTrello } from "react-icons/tfi";
import ThemeSelector from "./themeSelector";
import UserNav from "./userNav";
import { Link } from "react-router";

function Header() {
  return (
    <header className="header-component grid grid-cols-3 items-center p-5 dark:bg-gray-700 bg-gray-300">
      <div className="header-main-logo justify-self-start">
        <Link to="/">
          <TfiTrello className="w-6 h-6 md:w-8 md:h-8 text-black dark:text-white" />
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
