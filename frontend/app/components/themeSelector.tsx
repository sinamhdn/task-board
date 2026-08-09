import { FaMoon, FaSun } from "react-icons/fa";
import { LuEclipse } from "react-icons/lu";
import { useTheme } from "./theme";

function ThemeSelector() {
  const { theme, changeTheme } = useTheme();

  const index = {
    light: 0,
    dark: 1,
    system: 2,
  }[theme];

  const transformIndex = {
    light: 0,
    dark: 60,
    system: 120,
  }[theme];

  return (
    <div className="user-nav flex relative w-48 rounded-lg pr-1 pl-1 bg-gray-200 dark:bg-gray-800">
      {/* can't use icons with html select so we use custom selector */}
      {/* <select
        value={theme}
        onChange={(e) => changeTheme(e.target.value as any)}
      >
        <option value="system">
          System <LuEclipse />
        </option>
        <option value="light">
          Light <FaSun className="amber-300" />
        </option>
        <option value="dark">
          Dark <FaMoon className="mist-500" />
        </option>
      </select> */}
      <div
        className="absolute top-1 bottom-1 w-1/3 rounded-md bg-white shadow transition-transform duration-300 dark:bg-gray-700"
        style={{
          // transform: `translateX(${index * 100}%)`,
          transform: `translateX(${transformIndex}px)`,
        }}
      />

      <button
        onClick={() => changeTheme("light")}
        className="relative z-10 flex flex-1 items-center justify-center gap-2 py cursor-pointer"
      >
        <FaSun className="text-amber-600 dark:text-amber-300" />
        {/* Light */}
      </button>

      <button
        onClick={() => changeTheme("dark")}
        className="relative z-10 flex flex-1 items-center justify-center gap-2 py-2 cursor-pointer"
      >
        <FaMoon className="text-mist-600 dark:text-mist-300" />
        {/* Dark */}
      </button>

      <button
        onClick={() => changeTheme("system")}
        className="relative z-10 flex flex-1 items-center justify-center gap-2 py-2 cursor-pointer"
      >
        <LuEclipse className="text-blue-600 dark:text-blue-300" />
        {/* System */}
      </button>
    </div>
  );
}

export default ThemeSelector;
