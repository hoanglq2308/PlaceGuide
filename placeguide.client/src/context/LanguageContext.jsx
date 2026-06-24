import { createContext, useContext, useMemo, useState } from 'react';
import {
  DEFAULT_LANGUAGE,
  getUiText,
  isSupportedLanguage
} from '../i18n/languageConfig';

const LANGUAGE_STORAGE_KEY = 'placeGuideLanguage';
const LanguageContext = createContext(null);

function getInitialLanguage() {
  try {
    const storedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);

    return isSupportedLanguage(storedLanguage)
      ? storedLanguage
      : DEFAULT_LANGUAGE;
  } catch {
    return DEFAULT_LANGUAGE;
  }
}

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(getInitialLanguage);

  const setLanguage = (nextLanguage) => {
    if (!isSupportedLanguage(nextLanguage)) {
      return;
    }

    setLanguageState(nextLanguage);

    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
    } catch {
      // The selected language remains available for the current session.
    }
  };

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t: (key) => getUiText(language, key)
    }),
    [language]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider.');
  }

  return context;
}
