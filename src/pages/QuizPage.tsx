import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { QuizSession } from '@/domain/types';
import { ProgressBar } from '@/components/quiz/ProgressBar';
import { QuestionView } from '@/components/quiz/QuestionView';
import { QuizTimer } from '@/components/quiz/QuizTimer';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { getTestById } from '@/storage/testRepository';
import {
  completeQuiz,
  countUnanswered,
  createQuizSession,
} from '@/services/quizService';

/** Экран прохождения теста (FR-020–FR-022) */
export function QuizPage() {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [session, setSession] = useState<QuizSession | null>(null);
  const [confirmFinish, setConfirmFinish] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      if (!testId) return;
      const test = await getTestById(testId);
      if (!test) {
        navigate('/');
        return;
      }
      setSession(createQuizSession(test.id, test.title, test.data));
      setLoading(false);
    })();
  }, [testId, navigate]);

  const finishQuiz = useCallback(async () => {
    if (!session) return;
    const result = await completeQuiz(session);
    sessionStorage.setItem(`quiz-result-${session.testId}`, JSON.stringify(result));
    navigate(`/quiz/${session.testId}/result`);
  }, [session, navigate]);

  const tryFinish = () => {
    if (!session) return;
    const unanswered = countUnanswered(session);
    if (unanswered > 0) {
      setConfirmFinish(true);
      return;
    }
    void finishQuiz();
  };

  if (loading || !session) {
    return <p>{t('app.loading')}</p>;
  }

  const q = session.questions[session.currentIndex]!;
  const selected = session.answers.get(q.id);

  return (
    <div>
      <ProgressBar current={session.currentIndex + 1} total={session.questions.length} />
      <p className="text-muted">
        {t('test.questionOf', {
          current: session.currentIndex + 1,
          total: session.questions.length,
        })}
      </p>
      <QuizTimer timeLimitSeconds={session.timeLimit} onExpire={() => void finishQuiz()} />
      <QuestionView
        question={q}
        selectedIndex={selected}
        onSelect={(idx) => {
          setSession((s) => {
            if (!s) return s;
            const next = { ...s, answers: new Map(s.answers) };
            next.answers.set(q.id, idx);
            return next;
          });
        }}
      />
      <div className="actions-row">
        <button
          type="button"
          className="btn btn-secondary"
          disabled={session.currentIndex === 0}
          onClick={() =>
            setSession((s) => s && { ...s, currentIndex: s.currentIndex - 1 })
          }
        >
          {t('test.back')}
        </button>
        {session.currentIndex < session.questions.length - 1 ? (
          <button
            type="button"
            className="btn"
            onClick={() =>
              setSession((s) => s && { ...s, currentIndex: s.currentIndex + 1 })
            }
          >
            {t('test.forward')}
          </button>
        ) : null}
        <button type="button" className="btn" onClick={tryFinish}>
          {t('test.finish')}
        </button>
      </div>
      <ConfirmDialog
        open={confirmFinish}
        message={t('test.confirmFinish', { count: countUnanswered(session) })}
        onConfirm={() => {
          setConfirmFinish(false);
          void finishQuiz();
        }}
        onCancel={() => setConfirmFinish(false)}
      />
    </div>
  );
}
