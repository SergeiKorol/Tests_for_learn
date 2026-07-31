import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { QuizResult } from '@/domain/types';

/** Экран результата прохождения (FR-023) */
export function QuizResultPage() {
  const { testId } = useParams<{ testId: string }>();
  const { t } = useTranslation();
  const [result, setResult] = useState<QuizResult | null>(null);

  useEffect(() => {
    if (!testId) return;
    const raw = sessionStorage.getItem(`quiz-result-${testId}`);
    if (raw) {
      setResult(JSON.parse(raw) as QuizResult);
    }
  }, [testId]);

  if (!result) {
    return (
      <div>
        <p>{t('app.loading')}</p>
        <Link to="/">{t('result.backHome')}</Link>
      </div>
    );
  }

  return (
    <div>
      <h1>{t('result.title')}</h1>
      <p>
        {t('result.score', {
          score: result.score,
          total: result.totalQuestions,
          percent: result.percent,
        })}
      </p>
      <ul className="test-list">
        {result.details.map((d) => {
          const skipped = d.chosenIndex === null;
          const cls = skipped || !d.isCorrect ? 'result-incorrect' : 'result-correct';
          return (
            <li key={d.questionId} className={`card ${cls}`}>
              <p>
                <strong>{d.text}</strong>
              </p>
              <p className="text-muted">
                {t('result.yourAnswer')}:{' '}
                {skipped
                  ? t('result.skipped')
                  : d.options[d.chosenIndex!] ?? t('result.skipped')}
              </p>
              <p className="text-muted">
                {t('result.correctAnswer')}: {d.options[d.correctIndex]}
              </p>
              <span className="badge">
                {d.isCorrect ? t('result.correct') : t('result.incorrect')}
              </span>
            </li>
          );
        })}
      </ul>
      <Link to="/" className="btn">
        {t('result.backHome')}
      </Link>
    </div>
  );
}
