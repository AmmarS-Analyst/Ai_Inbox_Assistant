'use client';

import { ReactNode } from 'react';
import { ToastProvider } from '@/components/Toast';
import NavBar from '@/components/NavBar';
import { motion } from 'framer-motion';
import { fadeIn } from '@/lib/animations';
import { useLanguage } from '@/contexts/LanguageContext';

interface LayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: LayoutProps) {
  const { lang } = useLanguage();
  
  return (
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <ToastProvider>
        <NavBar />
        <motion.main
          {...fadeIn}
          className="min-h-[calc(100vh-4rem)] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full"
        >
          {children}
        </motion.main>
      </ToastProvider>
    </div>
  );
}