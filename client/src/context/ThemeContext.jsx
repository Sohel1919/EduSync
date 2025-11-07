import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('careSync-theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    setIsDark(prev => {
      const newTheme = !prev;
      if (newTheme) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('careSync-theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('careSync-theme', 'light');
      }
      return newTheme;
    });
  };

  const theme = {
    isDark,
    toggleTheme,
    colors: {
      primary: isDark ? '#7dd3fc' : '#0ea5e9',
      secondary: isDark ? '#d8b4fe' : '#a855f7',
      background: isDark ? '#0f172a' : '#f8fafc',
      card: isDark ? '#1e293b' : '#ffffff',
      text: isDark ? '#f1f5f9' : '#0f172a',
      textMuted: isDark ? '#cbd5e1' : '#64748b',
    }
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};