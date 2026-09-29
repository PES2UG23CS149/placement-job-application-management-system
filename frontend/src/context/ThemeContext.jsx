import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

const ThemeContext = createContext(null);

const THEMES = ['default', 'light', 'dark'];

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');

    return THEMES.includes(savedTheme)
      ? savedTheme
      : 'default';
  });

  useEffect(() => {
    document.documentElement.setAttribute(
      'data-theme',
      theme
    );

    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        themes: THEMES,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}