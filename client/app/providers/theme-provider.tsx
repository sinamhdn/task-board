// import type React from "react";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type Theme = "light" | "dark" | "system";

// hide implementation details by exporting changeTheme instead of setTheme
type ThemeContextType = {
  theme: Theme;
  changeTheme: (theme: Theme) => void;
  // setTheme: React.Dispatch<React.SetStateAction<Theme>>;
};

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  //   const [theme, setTheme] = useState<"light" | "dark" | "system">(
  // () =>
  //   (localStorage.getItem("theme") as "light" | "dark" | "system") ??
  //   "system",
  // "system",
  //   );
  const [theme, setTheme] = useState<Theme>("system");

  // get theme value from local storage
  useEffect(() => {
    // ✅ This only runs in the browser, after mount
    const saved = localStorage.getItem("theme");
    if (saved) {
      setTheme(saved as "light" | "dark" | "system");
    }
  }, []);

  // save theme value in local storage
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

  // set browsers color scheme so browser elements like scroll bar matches the theme
  useEffect(() => {
    const isDark =
      theme === "dark" ||
      (theme === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.style.colorScheme = isDark ? "dark" : "light";
  }, [theme]);

  const changeTheme = (theme: Theme) => {
    setTheme(theme);
  };

  // we sent changeTheme instead of setTheme through the states
  return (
    <ThemeContext.Provider value={{ theme, changeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used inside useTheme Provider.");
  }

  return context;
}
