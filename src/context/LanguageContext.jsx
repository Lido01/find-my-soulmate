// ─────────────────────────────────────────────────────────────────────────────
// LanguageContext.jsx — Global language state provider
// Commit: feat: add LanguageContext provider for EN/AM toggle
// ─────────────────────────────────────────────────────────────────────────────
import { createContext, useContext, useState, useCallback } from 'react';
import { LANGUAGES, TRANSLATIONS } from '../data/i18n.js';
import { saveLanguage, loadLanguage } from '../utils/storage.js';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => loadLanguage());

  const setLang = useCallback((l) => {
    setLangState(l);
    saveLanguage(l);
  }, []);

  const t = TRANSLATIONS[lang] || TRANSLATIONS[LANGUAGES.EN];

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLang must be used inside LanguageProvider');
  return ctx;
}
