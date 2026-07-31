/**
 * Доменные типы Offline Quiz App.
 * Соответствуют data-model.md и contracts/.
 */

export const BUILTIN_TEST_ID = '__builtin_welcome__';

export type TestSource = 'builtin' | 'downloaded' | 'imported';

export type Theme = 'light' | 'dark';

export type Locale = 'ru' | 'en';

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
}

/** JSON-контракт файла теста. */
export interface TestData {
  id: string;
  title: string;
  description?: string;
  version: number;
  timeLimit: number;
  questions: Question[];
}

/** Запись теста в IndexedDB. */
export interface TestRecord {
  id: string;
  title: string;
  version: number;
  data: TestData;
  builtin: boolean;
  source: TestSource;
  downloadedAt?: Date;
}

/** Элемент удалённого index.json. */
export interface CatalogEntry {
  id: string;
  title: string;
  description?: string;
  version: number;
  questionsCount: number;
  filename?: string;
}

export type CatalogDownloadStatus = 'available' | 'up_to_date';

export interface CatalogItemWithStatus extends CatalogEntry {
  status: CatalogDownloadStatus;
}

export interface AnswerSnapshot {
  questionId: string;
  chosenIndex: number | null;
}

/** Запись попытки прохождения в IndexedDB. */
export interface ResultRecord {
  id?: number;
  testId: string;
  testTitle: string;
  completedAt: Date;
  score: number;
  totalQuestions: number;
  percent: number;
  answersSnapshot: AnswerSnapshot[];
}

export type SettingKey = 'catalogBaseUrl' | 'theme' | 'locale';

export interface SettingRecord {
  key: SettingKey;
  value: string;
}

/** Состояние сессии прохождения (in-memory). */
export interface QuizSession {
  testId: string;
  testTitle: string;
  questions: Question[];
  timeLimit: number;
  startedAt: Date;
  currentIndex: number;
  answers: Map<string, number | null>;
}

export interface QuizResult {
  score: number;
  totalQuestions: number;
  percent: number;
  answersSnapshot: AnswerSnapshot[];
  details: Array<{
    questionId: string;
    text: string;
    options: string[];
    chosenIndex: number | null;
    correctIndex: number;
    isCorrect: boolean;
  }>;
}

export interface TestStatistics {
  testId: string;
  attemptCount: number;
  averagePercent: number;
  bestPercent: number;
  worstPercent: number;
}
