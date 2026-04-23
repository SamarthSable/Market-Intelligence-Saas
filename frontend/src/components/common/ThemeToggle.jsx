import { FaMoon, FaSun } from "react-icons/fa6";
import { useTheme } from "../../app/useTheme";

export default function ThemeToggle({ className = "" }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      className={`theme-toggle ${className}`.trim()}
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
      title={`Switch to ${isDark ? "light" : "dark"} theme`}
    >
      <span className="theme-toggle-icon">{isDark ? <FaSun /> : <FaMoon />}</span>
      <span className="theme-toggle-label">{isDark ? "Light mode" : "Dark mode"}</span>
    </button>
  );
}
