import dynamic from 'next/dynamic';
import React from 'react';

// Dynamically load the client ThemeToggle (no SSR) to avoid hydration mismatches
const ThemeToggleClient = dynamic(() => import('./ThemeToggleClient'), { 
  ssr: false,
  loading: () => (
    <button className="p-2 rounded-lg bg-gray-100 dark:bg-slate-700 transition-colors duration-200 flex items-center gap-2" aria-hidden>
      <div className="w-6 h-6 flex items-center justify-center">
        <svg className="w-5 h-5 text-yellow-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" d="M12 3v2m0 14v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2m18 0h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4M12 7a5 5 0 100 10 5 5 0 000-10z" />
        </svg>
      </div>
    </button>
  )
});

export default function ThemeToggle() {
  return <ThemeToggleClient />;
}


