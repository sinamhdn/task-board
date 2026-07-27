import { useEffect, useState } from "react";
import { TfiTrello } from "react-icons/tfi";

function Header() {
  const [theme, setTheme] = useState<"light" | "dark" | "system">(
    // () =>
    //   (localStorage.getItem("theme") as "light" | "dark" | "system") ??
    //   "system",
    "system",
  );

  useEffect(() => {
    // ✅ This only runs in the browser, after mount
    const saved = localStorage.getItem("theme");
    if (saved) {
      setTheme(saved as "light" | "dark" | "system");
    }
  }, []);

  // save theme value in lcal storage
  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  // add "dark class o html element if conditions are met."
  useEffect(() => {
    const html = document.documentElement;
    html.classList.remove("dark");

    if (theme === "dark") {
      html.classList.add("dark");
    } else if (theme === "system") {
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        html.classList.add("dark");
      }
    }
  }, [theme]);

  // actively update theme color if i change the os theme in system mode
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const updateTheme = () => {
      if (theme === "system") {
        document.documentElement.classList.toggle("dark", media.matches);
      }
    };
    media.addEventListener("change", updateTheme);
    return () => media.removeEventListener("change", updateTheme);
  }, [theme]);

  // set browsers colo scheme so browser elements like scroll bar matches the theme
  useEffect(() => {
    const isDark =
      theme === "dark" ||
      (theme === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.style.colorScheme = isDark ? "dark" : "light";
  }, [theme]);

  return (
    <header className="header-component">
      <div className="main-logo">
        <TfiTrello />
      </div>
      <div className="theme-selector">
        <select value={theme} onChange={(e) => setTheme(e.target.value as any)}>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="system">System</option>
        </select>
      </div>
    </header>
  );
}

export default Header;
