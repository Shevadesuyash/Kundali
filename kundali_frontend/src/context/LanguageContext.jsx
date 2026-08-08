import { createContext, useContext, useState } from 'react';
import { t } from '../utils/i18n';

export const LanguageContext = createContext({ lang: 'en', setLang: () => {} });

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('en');
  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

/** Hook: returns { lang, setLang, t: (key) => translated string } */
export function useLang() {
  const { lang, setLang } = useContext(LanguageContext);
  return { lang, setLang, t: (key) => t(key, lang) };
}
