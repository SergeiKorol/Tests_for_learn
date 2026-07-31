# Implementation Plan: Offline Quiz App — MVP

**Branch**: `001-offline-quiz-mvp` | **Date**: 2026-07-31 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-offline-quiz-mvp/spec.md`

## Summary

Офлайн PWA для текстовых тестов: встроенный welcome-тест при первом запуске,
ручная загрузка каталога из HTTPS-источника (GitHub Raw), импорт JSON,
прохождение с таймером и историей, настройки (тема RU/EN). Все данные — в
IndexedDB на клиенте; серверной логики нет.

**Технический подход**: React 18 + TypeScript + Vite; `vite-plugin-pwa` (Workbox)
для precache оболочки; Dexie для IndexedDB; слои UI → Services → Storage;
валидация JSON через Zod; i18next для RU/EN.

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js 20 LTS (dev)

**Primary Dependencies**: React 18, React Router 6, Vite 5, vite-plugin-pwa,
Workbox, Dexie 4, Zod, i18next, react-i18next

**Storage**: IndexedDB (Dexie) — tests, results, settings; localStorage — только
theme/language для мгновенного применения до инициализации Dexie (дублируется в
settings для консистентности)

**Testing**: Vitest (unit), Playwright (e2e: офлайн, PWA smoke, quiz flow)

**Target Platform**: PWA — Chrome/Edge/Firefox/Safari (desktop + mobile), viewport
320px–4K

**Project Type**: Single-page web application (client-only PWA)

**Performance Goals**: FCP < 2s на 3G после первого визита; precached shell;
скачивание теста до 50 вопросов < 30s на типичном мобильном Wi‑Fi

**Constraints**: Offline-first; bundle без удалённых тестов (кроме builtin); HTTPS
only для источника; zero telemetry

**Scale/Scope**: ~8 экранов, 1 builtin test, неограниченная локальная история;
каталог до ~500 записей index.json

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Принцип / NFR | Статус | Реализация в плане |
|---------------|--------|-------------------|
| I. Offline-First | ✅ PASS | Precache shell; тесты в IndexedDB; сеть только по кнопке |
| II. Client-Only | ✅ PASS | Нет backend; static JSON из HTTPS |
| III. Local Storage & Privacy | ✅ PASS | Dexie; нет analytics/telemetry |
| IV. PWA Cross-Platform | ✅ PASS | manifest + SW + responsive layout |
| V. Minimal Footprint | ✅ PASS | Один builtin в bundle; остальное on-demand |
| NFR-01 … NFR-10 | ✅ PASS | Покрыты spec + data-model + quickstart |

**Post-Phase 1 re-check**: ✅ Все gates соблюдены. Complexity Tracking пуст —
дополнительных нарушений нет.

## Project Structure

### Documentation (this feature)

```text
specs/001-offline-quiz-mvp/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── test-schema.json
│   ├── catalog-schema.json
│   └── README.md
└── tasks.md             # Phase 2 — /speckit-tasks
```

### Source Code (repository root)

```text
public/
├── icons/                   # PWA icons 192/512
└── robots.txt

src/
├── app/
│   ├── App.tsx
│   ├── router.tsx
│   └── providers.tsx        # theme, i18n, db init
├── pages/
│   ├── HomePage.tsx
│   ├── QuizPage.tsx
│   ├── QuizResultPage.tsx
│   ├── HistoryPage.tsx
│   ├── HistoryDetailPage.tsx
│   └── SettingsPage.tsx
├── components/
│   ├── layout/              # AppShell, NavBar
│   ├── quiz/                # QuestionView, Timer, ProgressBar
│   ├── catalog/             # CatalogModal, DownloadProgress
│   └── common/              # ConfirmDialog, ThemeToggle
├── services/
│   ├── catalogService.ts    # fetch index.json, compare versions
│   ├── downloadService.ts   # batch download + progress
│   ├── importService.ts     # FileReader + validate
│   ├── quizService.ts       # scoring, session state
│   ├── historyService.ts    # stats, clear
│   └── settingsService.ts   # reset, defaults
├── storage/
│   ├── db.ts                # Dexie schema
│   ├── testRepository.ts
│   ├── resultRepository.ts
│   └── settingsRepository.ts
├── domain/
│   ├── types.ts
│   ├── validation.ts        # Zod schemas
│   └── builtinTest.ts       # __builtin_welcome__ constant
├── i18n/
│   ├── index.ts
│   ├── ru.json
│   └── en.json
├── styles/
│   ├── tokens.css           # CSS variables, dark/light
│   └── global.css
└── main.tsx

tests/
├── unit/
│   ├── quizService.test.ts
│   ├── validation.test.ts
│   └── catalogService.test.ts
└── e2e/
    ├── offline-first.spec.ts
    ├── download-test.spec.ts
    └── quiz-flow.spec.ts

index.html
vite.config.ts
package.json
tsconfig.json
playwright.config.ts
.env.example                 # VITE_DEFAULT_CATALOG_URL
```

**Structure Decision**: Single-project SPA (Option 1). Разделение UI / Services /
Storage соответствует конституции (SoC). Page components не обращаются к Dexie
напрямую.

## Complexity Tracking

> Нет нарушений конституции, требующих обоснования.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — | — | — |
