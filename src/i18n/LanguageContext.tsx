import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Language, translations } from './translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (path: string, fallback?: string) => string;
  formatNumber: (val: number | string) => string;
  isBengali: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'mb_language';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'en' || saved === 'bn') return saved;
    } catch {
      // Fallback
    }
    return 'bn';
  });

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
      document.cookie = `mb_lang=${lang}; Max-Age=31536000; Path=/; SameSite=Lax`;
    } catch {
      // Storage error ignore
    }
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(language === 'bn' ? 'en' : 'bn');
  }, [language, setLanguage]);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  // Dot notation lookup helper: e.g. t('nav.home')
  const t = useCallback(
    (path: string, fallback = ''): string => {
      const parts = path.split('.');
      let current: any = translations[language];
      for (const part of parts) {
        if (current && typeof current === 'object' && part in current) {
          current = current[part];
        } else {
          // If missing in current language, try fallback in 'bn'
          let bnFallback: any = translations.bn;
          for (const fbPart of parts) {
            if (bnFallback && typeof bnFallback === 'object' && fbPart in bnFallback) {
              bnFallback = bnFallback[fbPart];
            } else {
              bnFallback = undefined;
              break;
            }
          }
          return typeof bnFallback === 'string' ? bnFallback : fallback || path;
        }
      }
      return typeof current === 'string' ? current : fallback || path;
    },
    [language]
  );

  // Number format: 123 -> ১২৩ in bn, 123 in en
  const formatNumber = useCallback(
    (val: number | string): string => {
      const str = String(val);
      if (language === 'en') return str;
      const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
      return str.replace(/\d/g, (d) => bnDigits[Number(d)] ?? d);
    },
    [language]
  );

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t,
        formatNumber,
        isBengali: language === 'bn',
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
