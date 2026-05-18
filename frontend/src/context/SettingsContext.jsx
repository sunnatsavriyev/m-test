import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../translations';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'uz');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key) => {
    return translations[language]?.[key] || translations['uz']?.[key] || key;
  };

  const changeLanguage = (lang) => {
    if (['uz', 'ru', 'en'].includes(lang)) {
      setLanguage(lang);
    }
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <SettingsContext.Provider value={{ language, theme, changeLanguage, toggleTheme, setTheme, t }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
