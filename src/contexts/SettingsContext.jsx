import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
  // Theme state: default 'dark'
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('ka_crime_theme') || 'dark';
  });

  // AI Thresholds state
  const [aiThresholds, setAiThresholds] = useState(() => {
    const saved = localStorage.getItem('ka_crime_ai_thresholds');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse AI thresholds", e);
      }
    }
    return {
      alertIncrease: 20,
      criticalThreshold: 500,
      zScore: 2,
      predictionMonths: 3
    };
  });

  // Persist Theme and apply CSS class to body
  useEffect(() => {
    localStorage.setItem('ka_crime_theme', theme);
    if (theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
  }, [theme]);

  // Persist AI Thresholds
  useEffect(() => {
    localStorage.setItem('ka_crime_ai_thresholds', JSON.stringify(aiThresholds));
  }, [aiThresholds]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const updateAiThresholds = (newThresholds) => {
    setAiThresholds(newThresholds);
  };

  return (
    <SettingsContext.Provider value={{ theme, toggleTheme, aiThresholds, updateAiThresholds }}>
      {children}
    </SettingsContext.Provider>
  );
};
