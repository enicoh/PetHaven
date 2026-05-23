import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../data/translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    const saved = localStorage.getItem('pethaven_lang');
    return saved && ['en', 'fr', 'ar'].includes(saved) ? saved : 'en';
  });

  const setLanguage = (lang) => {
    if (['en', 'fr', 'ar'].includes(lang)) {
      setLanguageState(lang);
      localStorage.setItem('pethaven_lang', lang);
    }
  };

  useEffect(() => {
    // Sync the language attributes and RTL direction with the document root
    document.documentElement.lang = language;
    if (language === 'ar') {
      document.documentElement.dir = 'rtl';
    } else {
      document.documentElement.dir = 'ltr';
    }
  }, [language]);

  const t = (keyPath, params = {}) => {
    const keys = keyPath.split('.');
    let value = translations[language];
    
    for (const key of keys) {
      if (value && value[key] !== undefined) {
        value = value[key];
      } else {
        // Fallback to English if key is missing in the current language
        let engFallback = translations['en'];
        for (const fallbackKey of keys) {
          if (engFallback && engFallback[fallbackKey] !== undefined) {
            engFallback = engFallback[fallbackKey];
          } else {
            engFallback = null;
            break;
          }
        }
        value = engFallback || keyPath;
        break;
      }
    }

    if (typeof value === 'string') {
      return Object.keys(params).reduce((str, paramKey) => {
        return str.replace(new RegExp(`{${paramKey}}`, 'g'), params[paramKey]);
      }, value);
    }

    return value;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
