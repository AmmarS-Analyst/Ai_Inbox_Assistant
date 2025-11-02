'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeToggle from './ThemeToggle';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { HomeIcon, TicketIcon, ChartIcon } from '@/components/icons/Icons';

export default function NavBar() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800';
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-slate-900/90 border-b border-gray-200/50 dark:border-slate-700/50 backdrop-blur-xl shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 transition-all duration-300">
                AI Inbox
              </span>
            </Link>
            <div className="hidden sm:flex items-center gap-1">
              <Link
                href="/"
                className={`px-3 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all duration-200 ${isActive('/')}`}
              >
                <HomeIcon className="w-4 h-4" />
                Home
              </Link>
              <Link
                href="/tickets"
                className={`px-3 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all duration-200 ${isActive('/tickets')}`}
              >
                <TicketIcon className="w-4 h-4" />
                Tickets
              </Link>
              <Link
                href="/dashboard"
                className={`px-3 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all duration-200 ${isActive('/dashboard')}`}
              >
                <ChartIcon className="w-4 h-4" />
                Dashboard
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LangButton />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </motion.nav>
  );
}

function LangButton() {
  const { lang, toggleLanguage } = useLanguage();
  const label = lang === 'en' ? 'العربية' : 'English';
  return (
    <button
      onClick={toggleLanguage}
      className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-all duration-200 border border-gray-200/50 dark:border-slate-700/50"
      aria-label="Toggle language"
    >
      {label}
    </button>
  );
}