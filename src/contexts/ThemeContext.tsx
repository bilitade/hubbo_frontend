import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  actualTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem('theme') as Theme;
    return stored || 'light'; // Default to light mode
  });

  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>(() => {
    // Initialize with correct theme on mount
    const stored = localStorage.getItem('theme') as Theme;
    if (stored === 'dark') return 'dark';
    if (stored === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Add changing-theme class to disable transitions temporarily
    root.classList.add('changing-theme');
    
    // Remove old theme classes
    root.classList.remove('light', 'dark');

    let effectiveTheme: 'light' | 'dark';

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      effectiveTheme = systemTheme;
    } else {
      effectiveTheme = theme;
    }

    // Add new theme class
    root.classList.add(effectiveTheme);
    setActualTheme(effectiveTheme);
    localStorage.setItem('theme', theme);
    
    // Remove changing-theme class after a brief delay to re-enable transitions
    requestAnimationFrame(() => {
      setTimeout(() => {
        root.classList.remove('changing-theme');
      }, 50);
    });
  }, [theme]);

  // Listen for system theme changes
  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const root = window.document.documentElement;
      root.classList.add('changing-theme');
      
      const systemTheme = mediaQuery.matches ? 'dark' : 'light';
      setActualTheme(systemTheme);
      root.classList.remove('light', 'dark');
      root.classList.add(systemTheme);
      
      requestAnimationFrame(() => {
        setTimeout(() => {
          root.classList.remove('changing-theme');
        }, 50);
      });
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(actualTheme === 'dark' ? 'light' : 'dark');
  };

  const value: ThemeContextType = {
    theme,
    setTheme,
    toggleTheme,
    actualTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
