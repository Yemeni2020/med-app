import React, { createContext, useContext } from 'react';
import { ThemeProvider as NextThemeProvider, useTheme as useNextTheme } from 'next-themes';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  return (
    <NextThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <ThemeBridge>{children}</ThemeBridge>
    </NextThemeProvider>
  );
}

function ThemeBridge({ children }) {
  const { resolvedTheme, setTheme } = useNextTheme();
  const isDark = resolvedTheme === 'dark';

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
