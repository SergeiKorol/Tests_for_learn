import { BrowserRouter } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { AppProviders, useAppContext } from './providers';
import { AppRouter } from './router';

function AppContent() {
  const { theme, toggleTheme } = useAppContext();
  return (
    <AppShell theme={theme} onThemeToggle={toggleTheme}>
      <AppRouter />
    </AppShell>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <AppProviders>
        <AppContent />
      </AppProviders>
    </BrowserRouter>
  );
}
