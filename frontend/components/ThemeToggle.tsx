'use client';

import { useTheme } from '@/contexts/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors duration-200 flex items-center gap-2"
      aria-label="Toggle theme"
      aria-pressed={theme === 'dark'}
      title={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
    >
      <span className="sr-only">Toggle theme</span>
      <div className="w-6 h-6 flex items-center justify-center">
        {theme === 'light' ? (
          <svg className="w-5 h-5 text-yellow-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" d="M12 3v2m0 14v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2m18 0h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4M12 7a5 5 0 100 10 5 5 0 000-10z" />
          </svg>
        ) : (
          <svg className="w-5 h-5 text-gray-200" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
          </svg>
        )}
      </div>
    </button>
  );
}

