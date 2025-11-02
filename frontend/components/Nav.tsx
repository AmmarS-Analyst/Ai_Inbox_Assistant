// for legacy support
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';


export default function Nav() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-slate-800">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="font-display font-bold text-xl">
              Inbox Assistant
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <Link 
                href="/tickets"
                className={`text-sm ${isActive('/tickets') 
                  ? 'text-blue-600 dark:text-blue-400 font-medium' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}
              >
                Tickets
              </Link>
              <Link 
                href="/dashboard"
                className={`text-sm ${isActive('/dashboard') 
                  ? 'text-blue-600 dark:text-blue-400 font-medium' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}
              >
                Dashboard
              </Link>
            </div>
          </div>
                  
        </div>
      </div>
    </nav>
  );
}