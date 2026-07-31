import type { ReactNode } from 'react';
import { NavBar } from './NavBar';
import type { Theme } from '@/domain/types';

interface AppShellProps {
  children: ReactNode;
  theme: Theme;
  onThemeToggle: () => void;
}

/** Оболочка приложения с навигацией */
export function AppShell({ children, theme, onThemeToggle }: AppShellProps) {
  return (
    <>
      <NavBar theme={theme} onThemeToggle={onThemeToggle} />
      <main className="app-container">{children}</main>
    </>
  );
}
