# Offline Quiz App

Офлайн PWA для текстовых тестов. Документация фичи: `specs/001-offline-quiz-mvp/`.

## Требования

- Node.js 20+
- npm 10+

## Установка

```bash
cp .env.example .env
npm install
npm run dev
```

Откройте http://localhost:5173

## Сборка и PWA

```bash
npm run build
npm run preview
```

Установка через браузер (Chrome: иконка установки в адресной строке или кнопка в приложении).

## Тесты

```bash
npm run test
npm run test:e2e
```

## Переменные окружения

| Переменная | Описание |
|------------|----------|
| `VITE_DEFAULT_CATALOG_URL` | Базовый URL репозитория с `index.json` |

## Структура

- `src/pages` — экраны
- `src/services` — бизнес-логика
- `src/storage` — IndexedDB (Dexie)
- `src/domain` — типы и валидация
