'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Lang = 'en' | 'ar';

interface LanguageContextType {
  lang: Lang;
  toggleLanguage: () => void;
  setLanguage: (l: Lang) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Start with default 'en' to avoid hydration mismatch
  const [lang, setLang] = useState<Lang>('en');
  const [mounted, setMounted] = useState(false);

  // Hydrate from localStorage or navigator after mount
  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem('lang') as Lang | null;
      if (saved === 'en' || saved === 'ar') {
        setLang(saved);
      } else {
        const nav = navigator.language;
        const detected = nav.startsWith('ar') ? 'ar' : 'en';
        setLang(detected);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      try {
        localStorage.setItem('lang', lang);
      } catch (e) {
        // ignore
      }
    }
  }, [lang, mounted]);

  const toggleLanguage = () => setLang((l) => (l === 'en' ? 'ar' : 'en'));
  const setLanguage = (l: Lang) => setLang(l);

  return (
    <LanguageContext.Provider value={{ lang, toggleLanguage, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
