import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import i18n from '@/i18n';
import type { Locale, Theme } from '@/domain/types';
import { initializeStorage } from '@/storage/initStorage';
import {
  applyThemeToDocument,
  getLocale,
  getTheme,
  readLocaleFromLocalStorage,
  readThemeFromLocalStorage,
  setTheme as persistTheme,
} from '@/storage/settingsRepository';

interface AppContextValue {
  ready: boolean;
  theme: Theme;
  locale: Locale;
  toggleTheme: () => void;
  setThemeState: (theme: Theme) => void;
  setLocaleState: (locale: Locale) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext outside provider');
  return ctx;
}

interface AppProvidersProps {
  children: ReactNode;
}

/** Bootstrap: IndexedDB, theme, locale (T021) */
export function AppProviders({ children }: AppProvidersProps) {
  const [ready, setReady] = useState(false);
  const [theme, setThemeState] = useState<Theme>(() => readThemeFromLocalStorage() ?? 'light');
  const [locale, setLocaleState] = useState<Locale>(() => readLocaleFromLocalStorage() ?? 'ru');

  useEffect(() => {
    applyThemeToDocument(theme);
  }, [theme]);

  useEffect(() => {
    void (async () => {
      await initializeStorage();
      const th = await getTheme();
      const loc = await getLocale();
      setThemeState(th);
      setLocaleState(loc);
      applyThemeToDocument(th);
      await i18n.changeLanguage(loc);
      setReady(true);
    })();
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      void persistTheme(next);
      return next;
    });
  }, []);

  return (
    <AppContext.Provider
      value={{
        ready,
        theme,
        locale,
        toggleTheme,
        setThemeState,
        setLocaleState,
      }}
    >
      {ready ? children : <p style={{ padding: '1rem' }}>Loading…</p>}
    </AppContext.Provider>
  );
}
