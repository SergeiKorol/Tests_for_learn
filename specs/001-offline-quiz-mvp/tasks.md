---
description: "Task list for Offline Quiz App MVP implementation"
---

# Tasks: Offline Quiz App — MVP

**Input**: Design documents from `/specs/001-offline-quiz-mvp/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Unit/e2e задачи вынесены в финальную фазу (конституция рекомендует покрытие сервисов; TDD в spec не требовался).

**Organization**: Задачи сгруппированы по user stories для независимой реализации и проверки.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Можно выполнять параллельно (разные файлы, нет зависимостей от незавершённых задач)
- **[Story]**: User story из spec.md (US1–US8)

## Path Conventions

Single-project SPA: `src/`, `tests/` в корне репозитория (см. plan.md).

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Инициализация проекта Vite + React + TypeScript + PWA

- [x] T001 Create directory structure per plan.md (`src/`, `tests/`, `public/icons/`)
- [x] T002 Initialize npm project with dependencies in `package.json` (React 18, Vite 5, vite-plugin-pwa, Dexie, Zod, i18next, react-router-dom)
- [x] T003 [P] Configure TypeScript in `tsconfig.json` and `tsconfig.node.json`
- [x] T004 [P] Configure Vite base in `vite.config.ts` (React plugin, path aliases `@/`)
- [x] T005 [P] Create `.env.example` with `VITE_DEFAULT_CATALOG_URL`
- [x] T006 [P] Create entry files `index.html` and `src/main.tsx`
- [x] T007 [P] Add PWA placeholder icons in `public/icons/icon-192.png` and `public/icons/icon-512.png`
- [x] T008 [P] Configure Vitest in `vite.config.ts` and `package.json` scripts (`dev`, `build`, `preview`, `test`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Dexie, domain layer, layout shell, i18n, routing — блокирует все user stories

**⚠️ CRITICAL**: User story work MUST NOT begin until this phase is complete

- [x] T009 Implement Dexie schema v1 in `src/storage/db.ts` (tables: tests, results, settings)
- [x] T010 [P] Define domain types in `src/domain/types.ts` (TestRecord, ResultRecord, QuizSession, CatalogEntry)
- [x] T011 [P] Implement Zod schemas mirroring contracts in `src/domain/validation.ts`
- [x] T012 [P] Create welcome test constant in `src/domain/builtinTest.ts` (id `__builtin_welcome__`, theme question FR-003)
- [x] T013 Implement `testRepository` CRUD in `src/storage/testRepository.ts`
- [x] T014 [P] Implement `resultRepository` in `src/storage/resultRepository.ts` (incl. deleteByTestId)
- [x] T015 [P] Implement `settingsRepository` in `src/storage/settingsRepository.ts` (defaults from env)
- [x] T016 Implement first-launch seed logic (empty DB only, FR-001/FR-033) in `src/storage/initStorage.ts`
- [x] T017 [P] Setup i18next in `src/i18n/index.ts` with `src/i18n/ru.json` and `src/i18n/en.json` (shell keys)
- [x] T018 [P] Create design tokens in `src/styles/tokens.css` and base styles in `src/styles/global.css` (320px–800px layout)
- [x] T019 [P] Implement `AppShell` and `NavBar` in `src/components/layout/AppShell.tsx` and `NavBar.tsx`
- [x] T020 Implement `ConfirmDialog` in `src/components/common/ConfirmDialog.tsx`
- [x] T021 Implement app bootstrap in `src/app/providers.tsx` (db init, theme/locale from storage)
- [x] T022 Implement routes skeleton in `src/app/router.tsx` and wire in `src/app/App.tsx`
- [x] T023 Configure basic vite-plugin-pwa precache in `vite.config.ts` (shell assets)

**Checkpoint**: Foundation ready — можно начинать user stories

---

## Phase 3: User Story 1 — Первый запуск и ознакомительный тест (Priority: P1) 🎯 MVP

**Goal**: При первом открытии — один встроенный тест «Знакомство с приложением», доступный офлайн

**Independent Test**: QS-1 из quickstart.md — incognito + offline → один builtin-тест в списке

### Implementation for User Story 1

- [x] T024 [US1] Wire seed on app start via `src/app/providers.tsx` calling `src/storage/initStorage.ts`
- [x] T025 [P] [US1] Create `TestListItem` with builtin badge in `src/components/common/TestListItem.tsx`
- [x] T026 [US1] Implement `HomePage` test list and counter in `src/pages/HomePage.tsx` (FR-004, FR-005 partial)
- [x] T027 [US1] Add offline-safe loading state for Home in `src/pages/HomePage.tsx` (no network errors on boot)

**Checkpoint**: US1 — главный экран с одним welcome-тестом без сети

---

## Phase 4: User Story 2 — Прохождение теста и сохранение результата (Priority: P1)

**Goal**: Quiz flow: навигация, таймер, завершение с confirm, scoring, экран результата, запись в IndexedDB

**Independent Test**: QS-2, QS-3 — пройти тест, перезапуск → попытка в БД (до UI истории)

### Implementation for User Story 2

- [x] T028 [US2] Implement scoring and session logic in `src/services/quizService.ts` (FR-023, unanswered = wrong)
- [x] T029 [P] [US2] Create `ProgressBar` in `src/components/quiz/ProgressBar.tsx`
- [x] T030 [P] [US2] Create `QuestionView` in `src/components/quiz/QuestionView.tsx`
- [x] T031 [P] [US2] Create `QuizTimer` in `src/components/quiz/QuizTimer.tsx` (timeLimit auto-finish FR-021)
- [x] T032 [US2] Implement `QuizPage` with Back/Forward/Finish + skip confirm in `src/pages/QuizPage.tsx` (FR-020–FR-022)
- [x] T033 [US2] Implement `QuizResultPage` with score/percent/breakdown in `src/pages/QuizResultPage.tsx`
- [x] T034 [US2] Persist `ResultRecord` on complete in `src/services/quizService.ts` via `src/storage/resultRepository.ts`
- [x] T035 [US2] Register `/quiz/:testId` and result routes in `src/app/router.tsx`; link from `HomePage`

**Checkpoint**: US1+US2 — полный цикл «список → quiz → результат» офлайн

---

## Phase 5: User Story 3 — Загрузка тестов из удалённого источника (Priority: P2)

**Goal**: «Проверить новые тесты» → каталог → selective/batch download → progress → offline access

**Independent Test**: QS-4, QS-5 — online download, offline pass; version update wipes history with confirm

### Implementation for User Story 3

- [x] T036 [US3] Implement catalog fetch and status compare in `src/services/catalogService.ts` (FR-006–FR-009)
- [x] T037 [US3] Implement batch download with progress in `src/services/downloadService.ts` (FR-010, FR-011)
- [x] T038 [US3] Add history wipe before version upgrade in `src/services/downloadService.ts` (FR-009a)
- [x] T039 [P] [US3] Create `CatalogModal` with checkboxes in `src/components/catalog/CatalogModal.tsx` (FR-039)
- [x] T040 [P] [US3] Create `DownloadProgress` in `src/components/catalog/DownloadProgress.tsx`
- [x] T041 [US3] Integrate «Проверить новые тесты» and offline error in `src/pages/HomePage.tsx` (FR-012)
- [x] T042 [US3] Add NetworkFirst runtime caching for catalog URLs in `vite.config.ts`

**Checkpoint**: US3 — скачивание и офлайн-прохождение удалённых тестов

---

## Phase 6: User Story 4 — Смена источника тестов (Priority: P2)

**Goal**: Настраиваемый HTTPS catalogBaseUrl, валидация, применение при следующей проверке

**Independent Test**: Изменить URL в Settings → «Проверить новые тесты» запрашивает новый index.json

### Implementation for User Story 4

- [x] T043 [US4] Implement catalog URL normalize/validate (https only) in `src/services/settingsService.ts` (FR-013–FR-016)
- [x] T044 [US4] Add «Источник тестов» field to `src/pages/SettingsPage.tsx` (initial section)
- [x] T045 [US4] Wire Settings route and nav link in `src/app/router.tsx` and `src/components/layout/NavBar.tsx`

**Checkpoint**: US4 — смена репозитория без авторизации GitHub

---

## Phase 7: User Story 8 — Установка PWA и офлайн-оболочка (Priority: P2)

**Goal**: Install prompt, standalone mode, precached shell works offline

**Independent Test**: QS-8, QS-9 — install from preview; shell loads offline

### Implementation for User Story 8

- [x] T046 [US8] Complete PWA manifest (name, icons, display standalone) in `vite.config.ts`
- [x] T047 [US8] Implement `InstallButton` with beforeinstallprompt in `src/components/common/InstallButton.tsx` (FR-034)
- [x] T048 [US8] Add InstallButton and iOS «Add to Home Screen» hint in `src/pages/HomePage.tsx`
- [x] T049 [US8] Verify offline shell fallback (no error overlay) in `src/app/providers.tsx` and `HomePage`

**Checkpoint**: US8 — PWA installable, offline shell stable

---

## Phase 8: User Story 5 — Импорт теста из файла (Priority: P3)

**Goal**: Import JSON via file picker, validate, conflict overwrite with history warning

**Independent Test**: QS-6 — import valid file; overwrite shows warning and clears history

### Implementation for User Story 5

- [x] T050 [US5] Implement FileReader import flow in `src/services/importService.ts` (FR-017, FR-018)
- [x] T051 [US5] Add overwrite/cancel dialogs and history wipe in `src/services/importService.ts` (FR-019)
- [x] T052 [US5] Add «Импортировать тест из JSON» UI in `src/pages/SettingsPage.tsx`

**Checkpoint**: US5 — локальный импорт тестов

---

## Phase 9: User Story 6 — История и статистика (Priority: P3)

**Goal**: History list, attempt details, per-test stats, clear history with confirm

**Independent Test**: QS-2 follow-up — две попытки → History; clear → empty, tests remain

### Implementation for User Story 6

- [x] T053 [US6] Implement stats aggregation in `src/services/historyService.ts` (FR-025–FR-027)
- [x] T054 [US6] Implement `HistoryPage` with clear action in `src/pages/HistoryPage.tsx` (FR-028)
- [x] T055 [US6] Implement `HistoryDetailPage` with answer breakdown in `src/pages/HistoryDetailPage.tsx` (FR-026)
- [x] T056 [US6] Register `/history` routes and nav link in `src/app/router.tsx` and `NavBar.tsx`

**Checkpoint**: US6 — полная история и статистика

---

## Phase 10: User Story 7 — Настройки приложения (Priority: P3)

**Goal**: Theme, locale RU/EN, delete all + reset defaults, builtin restore on FR-031/FR-032 only

**Independent Test**: QS-7 — theme/locale persist; reset restores builtin; restart without reset does not

### Implementation for User Story 7

- [x] T057 [P] [US7] Create `ThemeToggle` in `src/components/common/ThemeToggle.tsx` (FR-029)
- [x] T058 [US7] Complete Settings page: locale, delete all, reset defaults in `src/pages/SettingsPage.tsx` (FR-030–FR-033)
- [x] T059 [US7] Implement delete-all and reset with builtin restore in `src/services/settingsService.ts`
- [x] T060 [US7] Sync theme/locale to localStorage + settings table in `src/app/providers.tsx`

**Checkpoint**: US7 — все настройки и управление данными

---

## Phase 11: Polish & Cross-Cutting Concerns

**Purpose**: Тесты, документация, финальная валидация quickstart

- [x] T061 [P] Unit tests for quiz scoring in `tests/unit/quizService.test.ts`
- [x] T062 [P] Unit tests for Zod validation in `tests/unit/validation.test.ts`
- [x] T063 [P] Unit tests for catalog compare in `tests/unit/catalogService.test.ts`
- [x] T064 [P] E2E offline first launch in `tests/e2e/offline-first.spec.ts` (QS-1)
- [x] T065 [P] E2E quiz flow in `tests/e2e/quiz-flow.spec.ts` (QS-2)
- [x] T066 [P] E2E download flow in `tests/e2e/download-test.spec.ts` (QS-4)
- [x] T067 Configure Playwright in `playwright.config.ts`
- [x] T068 Add responsive polish and long-text overflow fixes in `src/styles/global.css` (FR-038, FR-040)
- [x] T069 Expand i18n keys for all UI strings in `src/i18n/ru.json` and `src/i18n/en.json` (FR-030)
- [x] T070 Run quickstart.md scenarios QS-1 through QS-9 and fix gaps
- [x] T071 Update root `README.md` with setup, env, and PWA install notes (Russian)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — **BLOCKS all user stories**
- **US1 (Phase 3)**: Depends on Phase 2
- **US2 (Phase 4)**: Depends on Phase 2; integrates with US1 Home list
- **US3 (Phase 5)**: Depends on Phase 2; extends HomePage
- **US4 (Phase 6)**: Depends on Phase 2; uses settingsService (US3 benefits from default URL)
- **US8 (Phase 7)**: Depends on Phase 1–2; can parallel with US3–US4 after Foundational
- **US5 (Phase 8)**: Depends on Phase 2 + SettingsPage skeleton (T044)
- **US6 (Phase 9)**: Depends on US2 (results in DB)
- **US7 (Phase 10)**: Depends on T044 SettingsPage; completes settings started in US4
- **Polish (Phase 11)**: Depends on desired stories being complete

### User Story Dependencies

| Story | Priority | Depends on | Independent test |
|-------|----------|------------|------------------|
| US1 | P1 | Foundational | QS-1 |
| US2 | P1 | Foundational, US1 list | QS-2, QS-3 |
| US3 | P2 | Foundational | QS-4, QS-5 |
| US4 | P2 | Foundational | New catalog URL fetch |
| US8 | P2 | Foundational | QS-8 |
| US5 | P3 | Foundational, Settings shell | QS-6 |
| US6 | P3 | US2 results | History flow |
| US7 | P3 | US4 settings partial | QS-7 |

### Parallel Opportunities

**Phase 1**: T003–T008 parallel after T002

**Phase 2**: T010–T012, T014–T015, T017–T019 parallel after T009

**After Foundational**: US1 and US2 sequential recommended for MVP; US3/US4/US8 parallelizable across developers

**Phase 11**: T061–T066 all parallel

---

## Parallel Example: User Story 2

```bash
# Parallel UI components (after T028 quizService):
T029 ProgressBar → src/components/quiz/ProgressBar.tsx
T030 QuestionView → src/components/quiz/QuestionView.tsx
T031 QuizTimer → src/components/quiz/QuizTimer.tsx

# Then sequential:
T032 QuizPage → depends on T029–T031
T033 QuizResultPage
T034 persist results
T035 routes
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (**CRITICAL**)
3. Complete Phase 3: US1 — welcome test on Home
4. Complete Phase 4: US2 — quiz + result + save
5. **STOP and VALIDATE**: QS-1, QS-2 offline
6. Demo/deploy preview build

### Incremental Delivery

1. Setup + Foundational → foundation ready
2. US1 + US2 → **MVP demo** (offline quiz)
3. US3 + US4 → catalog download + custom source
4. US8 → PWA install
5. US5 + US6 + US7 → import, history, full settings
6. Polish → tests + quickstart sign-off

### Suggested MVP Scope

**Minimum shippable slice**: Phases 1–4 (T001–T035) — встроенный тест, прохождение, результат, локальное сохранение без GitHub.

---

## Notes

- Все пути — от корня репозитория
- UI MUST NOT импортировать Dexie напрямую — только services/storage
- Неотвеченные вопросы = неверные (clarification 2026-07-31)
- История удаляется при upgrade version и import overwrite (с confirm)
- Builtin restore только FR-031/FR-032, не при каждом старте
