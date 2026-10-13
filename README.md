# Taxi — админка

Панель администратора междугороднего такси Душанбе — Худжанд: заявки, водители и автомобили,
графики работы, города, клиенты и аналитика. Angular 21, данные пока демонстрационные и хранятся
в памяти вкладки (`src/app/admin/admin.data.ts`) — заменить на API, когда появится бэкенд.

Сайт: https://lakimov-ban.github.io/TaxiDushanbeKhujandAdmin/

## Разработка

```bash
npm ci
npm start        # http://localhost:4200
npx ng test --watch=false
```

## Публикация

Каждый push в `main` запускает `.github/workflows/deploy.yml`: тесты, сборка с
`--base-href /<имя репозитория>/` и выкладка в ветку `gh-pages`, откуда сайт отдаёт GitHub Pages.
