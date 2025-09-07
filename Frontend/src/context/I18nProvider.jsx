// src/context/I18nProvider.jsx
import React, { createContext, useState, useEffect } from "react";

// Create context - export only this from the context file
export const I18nContext = createContext();

// Provider component - the only export from this file
const I18nProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem("language") || "en";
  });
  const [translations, setTranslations] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Load translations when language changes
  useEffect(() => {
    const loadTranslations = async () => {
      setIsLoading(true);
      try {
        const translationModule = await import(`../locales/${language}.json`);
        setTranslations(translationModule.default);
      } catch (error) {
        console.error(`Failed to load translations for ${language}:`, error);
        if (language !== "en") {
          const fallbackModule = await import("../locales/en.json");
          setTranslations(fallbackModule.default);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadTranslations();
  }, [language]);

  // Function to change language
  const changeLanguage = (lang) => {
    localStorage.setItem("language", lang);
    setLanguage(lang);
  };

  // Translation function
  const t = (key, params = {}) => {
    if (isLoading) return key;

    const keys = key.split(".");
    let value = translations;

    for (const k of keys) {
      if (value && value[k] !== undefined) {
        value = value[k];
      } else {
        return key;
      }
    }

    if (typeof value === "string" && Object.keys(params).length > 0) {
      return Object.keys(params).reduce((str, param) => {
        return str.replace(`{{${param}}}`, params[param]);
      }, value);
    }

    return value || key;
  };

  const value = {
    language,
    changeLanguage,
    t,
    isLoading,
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

// Only export the component
export default I18nProvider;
