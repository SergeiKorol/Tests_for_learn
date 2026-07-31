import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { Theme } from '@/domain/types';
import { ThemeToggle } from '@/components/common/ThemeToggle';

interface NavBarProps {
  theme: Theme;
  onThemeToggle: () => void;
}

/** Навигация приложения */
export function NavBar({ theme, onThemeToggle }: NavBarProps) {
  const { t } = useTranslation();
  return (
    <nav className="nav-bar">
      <NavLink
        to="/"
        end
        className={({ isActive }) => (isActive ? 'active' : undefined)}
      >
        {t('nav.home')}
      </NavLink>
      <NavLink to="/history" className={({ isActive }) => (isActive ? 'active' : undefined)}>
        {t('nav.history')}
      </NavLink>
      <NavLink to="/settings" className={({ isActive }) => (isActive ? 'active' : undefined)}>
        {t('nav.settings')}
      </NavLink>
      <ThemeToggle theme={theme} onToggle={onThemeToggle} />
    </nav>
  );
}
