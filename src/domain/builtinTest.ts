/**
 * Встроенный ознакомительный тест (FR-003).
 * Демонстрирует навигацию, UI и переключение темы.
 */
import type { TestData } from './types';
import { BUILTIN_TEST_ID } from './types';

export const BUILTIN_WELCOME_TEST: TestData = {
  id: BUILTIN_TEST_ID,
  title: 'Знакомство с приложением',
  description: 'Краткий тур по возможностям Offline Quiz App',
  version: 1,
  timeLimit: 0,
  questions: [
    {
      id: 'q1',
      text: 'Это приложение работает без интернета после первого запуска?',
      options: ['Да', 'Нет, только онлайн'],
      correctIndex: 0,
    },
    {
      id: 'q2',
      text: 'Можно ли включить тёмную тему с помощью кнопки «Тема»?',
      options: ['Да', 'Нет'],
      correctIndex: 0,
    },
    {
      id: 'q3',
      text: 'Где можно скачать дополнительные тесты?',
      options: [
        'Кнопка «Проверить новые тесты» на главном экране',
        'Только через email',
        'Нигде, тесты встроены навсегда',
      ],
      correctIndex: 0,
    },
  ],
};
