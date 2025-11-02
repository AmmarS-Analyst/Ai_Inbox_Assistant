'use client';

import { ReactNode } from 'react';
import { ToastProvider } from '@/components/Toast';
import NavBar from '@/components/NavBar';
import { motion } from 'framer-motion';
import { fadeIn } from '@/lib/animations';

interface LayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: LayoutProps) {
  return (
    <>
      <ToastProvider>
        <NavBar />
        <motion.main
          {...fadeIn}
          className="min-h-[calc(100vh-4rem)] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full"
        >
          {children}
        </motion.main>
      </ToastProvider>
    </>
  );
}