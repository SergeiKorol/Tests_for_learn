# Contracts: Offline Quiz App — MVP

Контракты данных между приложением, репозиторием тестов и импортом файлов.

## Файлы

| Контракт | Файл | Направление |
|----------|------|-------------|
| Файл теста | [test-schema.json](./test-schema.json) | import, download, builtin |
| Каталог | [catalog-schema.json](./catalog-schema.json) | remote `index.json` |

## URL resolution

Базовый URL источника (`catalogBaseUrl`) — без trailing slash.

| Ресурс | URL |
|--------|-----|
| Каталог | `{catalogBaseUrl}/index.json` |
| Файл теста | `{catalogBaseUrl}/{filename ?? 'tests/' + id + '.json'}` |

Пример:

```text
catalogBaseUrl = https://raw.githubusercontent.com/OWNER/repo/main
→ index.json     = .../main/index.json
→ math-101       = .../main/tests/math-101.json
```

## Валидация в приложении

Runtime: Zod-схемы, эквивалентные JSON Schema выше (`src/domain/validation.ts`).

При ошибке:
- **import** — toast/alert, данные не меняются
- **download** — ошибка для одного теста, batch продолжается

## Версионирование контракта

- MINOR: новые optional поля
- MAJOR: удаление/переименование required полей → bump constitution + migration

## Пример валидного теста

```json
{
  "id": "sample-quiz",
  "title": "Пример",
  "version": 1,
  "timeLimit": 0,
  "questions": [
    {
      "id": "q1",
      "text": "2 + 2 = ?",
      "options": ["3", "4"],
      "correctIndex": 1
    }
  ]
}
```

## Пример index.json

```json
[
  {
    "id": "sample-quiz",
    "title": "Пример",
    "description": "Демо из репозитория",
    "version": 1,
    "questionsCount": 1,
    "filename": "tests/sample-quiz.json"
  }
]
```

## Internal UI routes (reference)

| Path | Screen |
|------|--------|
| `/` | Home — список тестов |
| `/quiz/:testId` | Прохождение |
| `/quiz/:testId/result` | Результат (после complete) |
| `/history` | История попыток |
| `/history/:resultId` | Детали попытки |
| `/settings` | Настройки |

Не HTTP API — client-side router only.
