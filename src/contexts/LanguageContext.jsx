import React, { createContext, useContext, useEffect, useState } from 'react';
import { Localization } from '../utils/localization';

export const LanguageContext = createContext(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeLanguage();
  }, []);

  const initializeLanguage = async () => {
    try {
      setIsLoading(true);
      const currentLanguage = await Localization.getCurrentLanguage();
      setLanguage(currentLanguage);
    } catch (error) {
      console.error('Error initializing language:', error);
      setLanguage('en'); // Default to English
    } finally {
      setIsLoading(false);
    }
  };

  const changeLanguage = async (newLanguage) => {
    try {
      await Localization.setLanguage(newLanguage);
      setLanguage(newLanguage);
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  // Translation function
  const t = (key) => {
    return Localization.t(key, language);
  };

  const value = {
    language,
    changeLanguage,
    t,
    isLoading,
    availableLanguages: Localization.getAvailableLanguages(),
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};