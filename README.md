# Todo

SPA для заметок и чек-листов на Nuxt 4, Pinia и TypeScript.

## Возможности

- Создание, редактирование и удаление заметок с чек-листами.
- Черновик, который можно восстановить после перезагрузки страницы.
- Undo/redo до 50 атомарных изменений, включая горячие клавиши `Ctrl/Cmd + Z` и `Ctrl/Cmd + Shift + Z`.
- Версионированное localStorage-хранилище и синхронизация списка между вкладками.
- Собственные доступные модальные окна: focus trap, Escape и клавиатурная навигация.

## Локальный запуск

Требуется Node.js 22 или новее.

```bash
npm install
npm run dev
```

Приложение откроется по адресу, который выведет Nuxt (по умолчанию `http://localhost:3000`).

## Проверки

```bash
npm test
npm run typecheck
npm run build
```

## Docker

После запуска Docker Desktop:

```bash
docker compose up --build
```

Затем откройте `http://localhost:3000`.
