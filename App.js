import React from 'react';
import { LanguageProvider } from './src/contexts/LanguageContext';
import AppNavigator from './src/navigation/AppNavigator';

const App = () => {
  return (
    <LanguageProvider>
      <AppNavigator />
    </LanguageProvider>
  );
};

export default App;