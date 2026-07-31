/**
 * Логика прохождения теста: сессия, scoring, сохранение (FR-020–FR-024).
 */
import type {
  Question,
  QuizResult,
  QuizSession,
  TestData,
} from '@/domain/types';
import { saveResult } from '@/storage/resultRepository';

/**
 * Создаёт новую сессию прохождения.
 */
export function createQuizSession(testId: string, testTitle: string, data: TestData): QuizSession {
  return {
    testId,
    testTitle,
    questions: data.questions,
    timeLimit: data.timeLimit,
    startedAt: new Date(),
    currentIndex: 0,
    answers: new Map(),
  };
}

/**
 * Подсчитывает результат; неотвеченные = неверные (FR-023).
 */
export function computeQuizResult(session: QuizSession): QuizResult {
  const { questions } = session;
  let score = 0;
  const answersSnapshot = questions.map((q) => {
    const chosen = session.answers.has(q.id) ? session.answers.get(q.id)! : null;
    const isCorrect = chosen !== null && chosen === q.correctIndex;
    if (isCorrect) score += 1;
    return { questionId: q.id, chosenIndex: chosen };
  });

  const totalQuestions = questions.length;
  const percent = totalQuestions === 0 ? 0 : Math.round((score / totalQuestions) * 100);

  const details = questions.map((q: Question) => {
    const chosenIndex = session.answers.has(q.id) ? session.answers.get(q.id)! : null;
    const isCorrect = chosenIndex !== null && chosenIndex === q.correctIndex;
    return {
      questionId: q.id,
      text: q.text,
      options: q.options,
      chosenIndex,
      correctIndex: q.correctIndex,
      isCorrect,
    };
  });

  return { score, totalQuestions, percent, answersSnapshot, details };
}

/**
 * Завершает тест и сохраняет попытку в IndexedDB.
 */
export async function completeQuiz(session: QuizSession): Promise<QuizResult> {
  const result = computeQuizResult(session);
  await saveResult({
    testId: session.testId,
    testTitle: session.testTitle,
    completedAt: new Date(),
    score: result.score,
    totalQuestions: result.totalQuestions,
    percent: result.percent,
    answersSnapshot: result.answersSnapshot,
  });
  return result;
}

/** @returns Число неотвеченных вопросов */
export function countUnanswered(session: QuizSession): number {
  return session.questions.filter((q) => !session.answers.has(q.id)).length;
}
