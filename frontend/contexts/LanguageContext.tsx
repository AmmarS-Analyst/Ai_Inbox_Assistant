'use client';

import { createContext, useContext, useLayoutEffect, useState } from 'react';

type Lang = 'en' | 'ar';

interface LanguageContextType {
  lang: Lang;
  toggleLanguage: () => void;
  setLanguage: (l: Lang) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const getInitial = (): Lang => {
    try {
      const saved = typeof window !== 'undefined' ? (localStorage.getItem('lang') as Lang | null) : null;
      if (saved === 'en' || saved === 'ar') return saved;
      const nav = typeof navigator !== 'undefined' ? navigator.language : 'en';
      return nav.startsWith('ar') ? 'ar' : 'en';
    } catch (e) {
      return 'en';
    }
  };

  const [lang, setLang] = useState<Lang>(getInitial);

  useLayoutEffect(() => {
    try {
      localStorage.setItem('lang', lang);
    } catch (e) {
      // ignore
    }
  }, [lang]);

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
