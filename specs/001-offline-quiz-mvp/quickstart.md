# Quickstart: Offline Quiz App — MVP

Руководство по проверке фичи end-to-end после реализации. Детали модели —
[data-model.md](./data-model.md); JSON-контракты — [contracts/](./contracts/).

## Prerequisites

- Node.js 20+
- npm 10+
- Chrome или Edge (PWA + DevTools offline)
- (Опционально) Публичный GitHub-репозиторий с `index.json` + `tests/*.json`

## Setup

```bash
# из корня репозитория (после реализации)
cp .env.example .env
# задать VITE_DEFAULT_CATALOG_URL=https://raw.githubusercontent.com/OWNER/repo/main

npm install
npm run dev
```

Открыть `http://localhost:5173`.

## Build & PWA preview

```bash
npm run build
npm run preview
```

В Chrome: Application → Service Workers — SW активен; Cache Storage содержит precache.

---

## Validation Scenarios

### QS-1: Первый запуск офлайн (P1, SC-001, SC-002)

1. DevTools → Network → **Offline**
2. Открыть приложение в режиме инкognito (пустая IndexedDB)
3. **Expected**: один тест «Знакомство с приложением», badge «встроенный»
4. Пройти тест до результата
5. **Expected**: счёт, %, разбор ответов; вопрос про тёмную тему

### QS-2: Прохождение с неотвеченными (Clarification Q1)

1. Открыть тест с ≥3 вопросами
2. Ответить на 1 вопрос, пропустить остальные
3. «Завершить тест» → подтвердить в диалоге
4. **Expected**: score = 1, total = все вопросы; пропущенные = неверные

### QS-3: Таймер (FR-021)

1. Импортировать или использовать тест с `"timeLimit": 60`
2. Начать прохождение, не отвечать
3. **Expected**: автозавершение через ~60s без extra confirm

### QS-4: Загрузка каталога (P2, SC-003)

1. Network → Online
2. Настроить валидный `catalogBaseUrl` в Settings
3. «Проверить новые тесты»
4. **Expected**: модал со списком, статусы «доступен» / «загружен»
5. Скачать один тест → progress → тест в Home
6. Network → Offline → пройти скачанный тест
7. **Expected**: работает без сети

### QS-5: Обновление version + история (Clarification Q3)

1. Пройти скачанный тест (1+ попытка в History)
2. В каталоге — version выше локальной
3. Скачать → **Expected**: предупреждение об удалении истории
4. Подтвердить → **Expected**: история по testId пуста; новая version в списке
5. Отменить (повтор) → **Expected**: старая version и история на месте

### QS-6: Импорт JSON (SC-004)

1. Settings → «Импортировать тест из JSON»
2. Выбрать файл по [test-schema.json](./contracts/test-schema.json)
3. **Expected**: тест в Home с source «импортированный»
4. Импорт с тем же id → Перезаписать → **Expected**: warning + history wipe

### QS-7: Настройки и сброс (Clarification Q2)

1. Сменить тему и язык EN → перезагрузить → сохранено
2. «Удалить все скачанные тесты и историю» → confirm
3. **Expected**: только builtin welcome
4. Удалить builtin вручную (dev) → перезапуск без сброса
5. **Expected**: builtin НЕ появляется
6. «Сбросить настройки» → **Expected**: defaults + builtin restored

### QS-8: PWA install (SC-007)

1. `npm run preview` over HTTPS or localhost
2. Дождаться `beforeinstallprompt` → «Установить»
3. Запуск с иконки standalone
4. **Expected**: без адресной строки; Home загружается

### QS-9: Privacy (SC-006)

1. DevTools → Network, фильтр Fetch/XHR
2. Пройти тест, открыть History, изменить Settings
3. **Expected**: нет POST/PUT с телом user data; только GET static JSON при download

---

## Automated tests (после реализации)

```bash
npm run test          # Vitest unit
npm run test:e2e      # Playwright
```

Минимальный e2e набор: `offline-first.spec.ts`, `quiz-flow.spec.ts`,
`download-test.spec.ts` — см. [plan.md](./plan.md).

## Troubleshooting

| Симптом | Проверка |
|---------|----------|
| Пустой список при первом запуске | IndexedDB → tests; init seed |
| Каталог 404 | URL без slash в конце; путь index.json |
| SW не кэширует | vite-plugin-pwa build mode, не dev-only |
| iOS нет install prompt | инструкция «На экран Домой» |

## Next step

После прохождения QS-1 … QS-9: `/speckit-tasks` для декомпозиции реализации.
