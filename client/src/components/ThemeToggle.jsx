import { useContext } from 'react';
import { ThemeContext } from '../App';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex items-center justify-center w-11 h-11 rounded-full border border-[var(--border-color)] bg-[var(--surface-color)] text-lg shadow-sm transition hover:shadow-md"
      aria-label="Toggle theme"
    >
      {isDark ? '🌜' : '🌞'}
    </button>
  );
};

export default ThemeToggle;

