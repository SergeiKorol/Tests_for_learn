import { Routes, Route } from 'react-router-dom';
import { HomePage } from '@/pages/HomePage';
import { QuizPage } from '@/pages/QuizPage';
import { QuizResultPage } from '@/pages/QuizResultPage';
import { HistoryPage } from '@/pages/HistoryPage';
import { HistoryDetailPage } from '@/pages/HistoryDetailPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { useAppContext } from './providers';

/** Маршруты SPA */
export function AppRouter() {
  const { theme, locale, setThemeState, setLocaleState } = useAppContext();

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/quiz/:testId" element={<QuizPage />} />
      <Route path="/quiz/:testId/result" element={<QuizResultPage />} />
      <Route path="/history" element={<HistoryPage />} />
      <Route path="/history/:resultId" element={<HistoryDetailPage />} />
      <Route
        path="/settings"
        element={
          <SettingsPage
            theme={theme}
            locale={locale}
            onThemeChange={setThemeState}
            onLocaleChange={setLocaleState}
          />
        }
      />
    </Routes>
  );
}
