import { useTranslation } from 'react-i18next';
import type { Theme } from '@/domain/types';

interface ThemeToggleProps {
  theme: Theme;
  onToggle: () => void;
}

/**
 * Переключатель светлой/тёмной темы (FR-029, FR-003 demo).
 */
export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      className="btn btn-secondary"
      onClick={onToggle}
      aria-label={t('settings.theme')}
      title={t('settings.theme')}
    >
      {t('settings.theme')}: {theme === 'dark' ? t('settings.themeDark') : t('settings.themeLight')}
    </button>
  );
}
