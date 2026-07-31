# Data Model: Offline Quiz App — MVP

**Date**: 2026-07-31  
**Feature**: [spec.md](./spec.md)

## Обзор

Три таблицы IndexedDB (Dexie) + ephemeral session state. Внешние контракты JSON —
в [contracts/](./contracts/).

```text
┌─────────────┐       ┌──────────────┐
│   tests     │1     *│   results    │
│  (testId)   │───────│  (testId FK) │
└─────────────┘       └──────────────┘

┌─────────────┐
│  settings   │  key-value
└─────────────┘
```

## Entity: TestRecord (таблица `tests`)

| Поле | Тип | Обязательно | Описание |
|------|-----|-------------|----------|
| id | string (PK) | да | Slug; builtin = `__builtin_welcome__` |
| title | string | да | Отображаемое название |
| version | number | да | ≥ 1 |
| data | TestData | да | Полный объект теста (см. contract) |
| builtin | boolean | да | true только для welcome |
| source | enum | да | `builtin` \| `downloaded` \| `imported` |
| downloadedAt | Date | нет | null для builtin до первой записи |

**TestData** (вложенный объект, mirrors test-schema.json):
- description?: string
- timeLimit: number (seconds, 0 = none)
- questions: Question[]

**Question**:
- id: string
- text: string
- options: string[] (min 2)
- correctIndex: number (0..options.length-1)

### Validation rules

- id: non-empty, `[a-z0-9_-]+` (builtin exception allowed)
- questions.length >= 1
- unique question.id within test
- correctIndex in range

### State transitions

```text
[first launch, empty DB] ──seed──► builtin TestRecord

[download new] ──insert──► TestRecord (source=downloaded)

[download newer version + user confirms] ──delete results by testId──► replace TestRecord

[import new id] ──insert──► TestRecord (source=imported)

[import overwrite + confirm] ──delete results──► replace TestRecord

[FR-031 delete all] ──clear non-builtin + results──► seed builtin

[FR-032 reset settings] ──restore defaults──► seed builtin if missing
```

**FR-001 / FR-033**: Seed builtin ONLY when `tests.count() === 0` (first launch).
NOT on subsequent starts if user removed builtin manually.

## Entity: ResultRecord (таблица `results`)

| Поле | Тип | Обязательно | Описание |
|------|-----|-------------|----------|
| id | number (PK, auto++) | да | Dexie `++id` |
| testId | string (index) | да | FK → tests.id |
| testTitle | string | да | Snapshot на момент попытки |
| completedAt | Date | да | ISO stored as Date |
| score | number | да | Правильных ответов |
| totalQuestions | number | да | = questions.length теста |
| percent | number | да | round(score/total*100) |
| answersSnapshot | AnswerSnapshot[] | да | См. ниже |

**AnswerSnapshot**:
- questionId: string
- chosenIndex: number | null (null = unanswered → wrong)

### Derived statistics (computed, not stored)

Per testId:
- attemptCount
- averagePercent
- bestPercent (max)
- worstPercent (min)

### Deletion triggers

- FR-028: clear all results
- FR-031: clear all results
- FR-009a / FR-019: delete where testId = X before test replace

## Entity: SettingRecord (таблица `settings`)

| key (PK) | value type | Default |
|----------|------------|---------|
| catalogBaseUrl | string | VITE_DEFAULT_CATALOG_URL |
| theme | `light` \| `dark` | `light` |
| locale | `ru` \| `en` | `ru` |

### Validation

- catalogBaseUrl: must start with `https://`, no trailing slash (normalize on save)

## Ephemeral: CatalogEntry (не персистится)

Загружается из `index.json`; см. catalog-schema.json.

**Download status** (UI-only):

| Status | Condition |
|--------|-----------|
| available | no local OR remote.version > local.version |
| up_to_date | local exists AND remote.version <= local.version |

## Ephemeral: QuizSession (in-memory + optional sessionStorage)

| Поле | Тип | Описание |
|------|-----|----------|
| testId | string | |
| startedAt | Date | |
| currentIndex | number | 0-based |
| answers | Map<questionId, number \| null> | |
| timeLimit | number | copy from test |
| expiresAt | Date? | if timeLimit > 0 |

On complete → compute score → ResultRecord → navigate to result page.

### Scoring (FR-023)

```text
totalQuestions = test.questions.length
score = count(q => answers[q.id] === q.correctIndex)
unanswered → chosenIndex null → not equal correctIndex → wrong
percent = round(score / totalQuestions * 100)
```

## Dexie schema version 1

```typescript
// Conceptual — implementation in src/storage/db.ts
db.version(1).stores({
  tests: 'id, builtin, source, downloadedAt',
  results: '++id, testId, completedAt',
  settings: 'key',
});
```

## Indexes & queries

| Query | Index |
|-------|-------|
| List all tests | tests.toArray(), sort title |
| Results by test, newest first | results.where('testId').equals(id).reverse().sortBy('completedAt') |
| All results history | results.orderBy('completedAt').reverse() |
| Delete results for test | results.where('testId').equals(id).delete() |
| Setting by key | settings.get(key) |

## Migration strategy

MVP: schema v1 only. Future versions: Dexie `db.version(n).upgrade()` — document
in CHANGELOG when test-schema changes.
