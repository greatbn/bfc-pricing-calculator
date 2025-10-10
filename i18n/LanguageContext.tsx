import React, { createContext, useState, useContext, useEffect, useCallback, ReactNode } from 'react';

type Language = 'en' | 'vi';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, options?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');
  const [translations, setTranslations] = useState<Record<Language, any> | null>(null);

  useEffect(() => {
    const loadTranslations = async () => {
      try {
        const [enRes, viRes] = await Promise.all([
          fetch('/i18n/en.json'),
          fetch('/i18n/vi.json')
        ]);
        if (!enRes.ok || !viRes.ok) {
            throw new Error(`HTTP error! status: ${enRes.status} ${viRes.status}`);
        }
        const enData = await enRes.json();
        const viData = await viRes.json();
        setTranslations({ en: enData, vi: viData });
      } catch (error) {
        console.error('Failed to load translation files:', error);
      }
    };
    loadTranslations();
  }, []);

  const t = useCallback((key: string, options?: Record<string, string | number>): string => {
    if (!translations) {
      return key; // Return key as a fallback while loading
    }
    const keys = key.split('.');
    let result = (translations[language] as any);
    for (const k of keys) {
      result = result?.[k];
      if (result === undefined) {
        // Fallback to English if translation is missing in the current language
        let fallbackResult = (translations.en as any);
        for (const fk of keys) {
            fallbackResult = fallbackResult?.[fk];
            if(fallbackResult === undefined) return key;
        }
        result = fallbackResult;
        break;
      }
    }
    
    if (typeof result === 'string' && options) {
      return Object.entries(options).reduce((acc, [optKey, optValue]) => {
        return acc.replace(`{${optKey}}`, String(optValue));
      }, result);
    }

    return result || key;
  }, [language, translations]);
  
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
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
