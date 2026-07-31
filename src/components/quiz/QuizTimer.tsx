import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface QuizTimerProps {
  timeLimitSeconds: number;
  onExpire: () => void;
}

/** Обратный отсчёт (FR-021) */
export function QuizTimer({ timeLimitSeconds, onExpire }: QuizTimerProps) {
  const { t } = useTranslation();
  const [remaining, setRemaining] = useState(timeLimitSeconds);

  useEffect(() => {
    if (timeLimitSeconds <= 0) return;
    setRemaining(timeLimitSeconds);
    const id = window.setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          window.clearInterval(id);
          onExpire();
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [timeLimitSeconds, onExpire]);

  if (timeLimitSeconds <= 0) return null;

  return (
    <p className="text-muted" role="timer">
      {t('test.timeLeft', { seconds: remaining })}
    </p>
  );
}
