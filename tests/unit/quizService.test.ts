import { describe, expect, it } from 'vitest';
import { createQuizSession, computeQuizResult } from '@/services/quizService';
import type { TestData } from '@/domain/types';

const sampleTest: TestData = {
  id: 'sample',
  title: 'Sample',
  version: 1,
  timeLimit: 0,
  questions: [
    { id: 'q1', text: 'Q1', options: ['A', 'B'], correctIndex: 0 },
    { id: 'q2', text: 'Q2', options: ['A', 'B'], correctIndex: 1 },
  ],
};

describe('quizService', () => {
  it('counts unanswered as wrong', () => {
    const session = createQuizSession('sample', 'Sample', sampleTest);
    session.answers.set('q1', 0);
    const result = computeQuizResult(session);
    expect(result.score).toBe(1);
    expect(result.totalQuestions).toBe(2);
    expect(result.percent).toBe(50);
  });
});
