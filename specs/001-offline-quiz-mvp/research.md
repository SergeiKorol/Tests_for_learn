# Research: Offline Quiz App — MVP

**Date**: 2026-07-31  
**Feature**: [spec.md](./spec.md)

## 1. Frontend framework

**Decision**: React 18 + TypeScript

**Rationale**: Зрелая экосистема для SPA/PWA; хорошая поддержка code-splitting
(Vite); знакомый стек для команды; богатый выбор тестовых инструментов.

**Alternatives considered**:
- **Vue 3** — проще порог входа, но меньше готовых PWA-примеров в проекте.
- **Vanilla TS** — минимальный bundle, но выше стоимость UI-слоя для 8 экранов.

## 2. Сборка и PWA

**Decision**: Vite 5 + `vite-plugin-pwa` (Workbox GenerateSW)

**Rationale**: Рекомендация конституции; precache HTML/JS/CSS/assets; runtime
caching для `https://raw.githubusercontent.com/*` и пользовательского catalog
host — **NetworkFirst** с timeout 10s.

**Alternatives considered**:
- **Manual service worker** — больше boilerplate, выше риск ошибок кэширования.
- **Create React App** — deprecated; слабая поддержка PWA из коробки.

**Конфигурация SW**:
- `globPatterns`: `**/*.{js,css,html,ico,png,svg,woff2}`
- Runtime route: `{urlPattern: /^https:\\/\\/.*\\/(index\\.json|tests\\/.*\\.json)$/i,
  handler: 'NetworkFirst', options: { cacheName: 'catalog-cache', networkTimeoutSeconds: 10 }}`
- `skipWaiting: false`, `clientsClaim: true` — пользователь контролирует обновление
  через перезагрузку (MVP без custom update UI).

## 3. Локальное хранилище

**Decision**: Dexie 4 (IndexedDB wrapper)

**Rationale**: Типизируемые таблицы; транзакции для «удалить историю + записать
тест»; async/await; стабильный API.

**Alternatives considered**:
- **idb** (Google) — ниже уровень, больше ручного CRUD.
- **localStorage для тестов** — лимит ~5MB, не подходит для библиотеки тестов.

**Схема**: см. [data-model.md](./data-model.md)

**Theme/language**: дублирование в localStorage (`theme`, `locale`) для применения
до `indexedDB.open`; источник истины после init — таблица `settings`.

## 4. Валидация JSON

**Decision**: Zod schemas, зеркалящие [contracts/](./contracts/)

**Rationale**: Runtime validation импорта и скачанных файлов; TypeScript inference;
понятные сообщения об ошибках для UI.

**Alternatives considered**:
- **JSON Schema + Ajv** — тяжелее bundle; избыточно для двух схем.
- **Ручные проверки** — хрупко, сложно поддерживать.

## 5. Роутинг и состояние quiz-сессии

**Decision**: React Router 6; состояние прохождения — React state + sessionStorage
backup (опционально, только на время прохождения)

**Rationale**: URL `/quiz/:testId`, `/quiz/:testId/result`; при refresh во время
quiz — предупреждение или восстановление из sessionStorage (research: восстановление
MVP — предложить «продолжить» если session < 24h, иначе начать заново).

**Alternatives considered**:
- **Zustand/Redux** — избыточно для MVP; quiz state локален странице.

## 6. i18n

**Decision**: i18next + react-i18next; локали `ru`, `en`; default `ru`

**Rationale**: Spec FR-030; JSON-файлы переводов; переключение без перезагрузки.

**Alternatives considered**:
- **react-intl** — сопоставимо; i18next проще для static JSON.

## 7. UI / стили

**Decision**: CSS custom properties (design tokens) + минималистичный Material-like
layout без полного MUI (bundle size)

**Rationale**: FR-038; dark/light через `[data-theme]`; max-width 800px контейнер;
touch-friendly targets ≥ 44px.

**Alternatives considered**:
- **MUI / Chakra** — быстрее UI, но +100KB gzip; противоречит minimal footprint.
- **Tailwind** — ок, но tokens.css проще для обучающего кода.

## 8. Тестирование

**Decision**: Vitest + @testing-library/react (unit); Playwright (e2e)

**Rationale**: Конституция требует unit для сервисов/парсинга и e2e для офлайн/
скачивания/quiz. Playwright: `context.setOffline(true)`, service worker support.

**Alternatives considered**:
- **Cypress** — хуже offline/SW сценарии в headless.

## 9. URL каталога по умолчанию

**Decision**: `import.meta.env.VITE_DEFAULT_CATALOG_URL` в `.env.example`

**Rationale**: Spec: «задаётся при развёртывании»; не хардкодить в исходниках.

**Placeholder**: `https://raw.githubusercontent.com/OWNER/offline-quiz-tests/main`

## 10. Install prompt (PWA)

**Decision**: Перехват `beforeinstallprompt`; кнопка «Установить» на HomePage;
скрывать после `appinstalled`

**Rationale**: FR-034; iOS Safari не поддерживает event — показать инструкцию
«Поделиться → На экран Домой» (detect `navigator.standalone` / user agent).

**Alternatives considered**:
- **Только browser chrome** — хуже discoverability на Android/desktop.

## Resolved NEEDS CLARIFICATION

Все технические unknowns из Technical Context разрешены выше. Бизнес-clarifications
уже в spec (Clarifications session 2026-07-31).
