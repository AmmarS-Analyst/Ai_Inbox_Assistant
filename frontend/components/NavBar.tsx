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
      className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 border-b border-gray-200 dark:border-slate-700 backdrop-blur-xl"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">
                AI Inbox
              </span>
            </div>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-2">
              <Link
                href="/"
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 ${isActive('/')}`}
              >
                <HomeIcon className="w-4 h-4" />
                Home
              </Link>
              {/* Inbox removed: page not implemented */}
              <Link
                href="/tickets"
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 ${isActive('/tickets')}`}
              >
                <TicketIcon className="w-4 h-4" />
                Tickets
              </Link>
              <Link
                href="/dashboard"
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 ${isActive('/dashboard')}`}
              >
                <ChartIcon className="w-4 h-4" />
                Dashboard
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* language toggle wired to global LanguageContext */}
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
  // when lang is 'en' show Arabic label to switch to Arabic; when 'ar' show English label
  const label = lang === 'en' ? 'العربية' : 'English';
  return (
    <button
      onClick={toggleLanguage}
      className="px-4 py-2 glass-effect rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100/10 transition-all duration-200"
      aria-label="Toggle language"
    >
      {label}
    </button>
  );
}