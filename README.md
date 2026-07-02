# Repetitor CRM

Repetitorlar va xususiy o'qituvchilar uchun guruh, o'quvchi, to'lov va davomat boshqaruv tizimi.

## Tuzilma

```
repetitor-crm/
  backend/    -> Node.js + Express + TypeORM + PostgreSQL
  frontend/   -> React + Vite + Tailwind
```

## Backend ishga tushirish

```bash
cd backend
npm install
cp .env
npm run dev
```

PostgreSQL'da `repetitor_crm` nomli bo'sh database yarating. `synchronize: true` rejimida TypeORM jadvallarni avtomatik yaratadi (development uchun, production'da migration ishlatish tavsiya etiladi).

## Frontend ishga tushirish

```bash
cd frontend
npm install
cp .env
npm run dev
```

## API Routelar (qisqacha)

- `POST /api/auth/register`, `/login`, `/refresh`
- `POST /api/groups`, `GET /api/groups`, `GET/PUT/DELETE /api/groups/:id`
- `POST /api/students/group/:groupId`, `GET /api/students/group/:groupId`, `PUT/DELETE /api/students/:id`
- `PATCH /api/payments/student/:studentId/toggle` (body: `{ month: "2026-06" }`)
- `GET /api/payments/group/:groupId/summary?month=2026-06`
- `GET /api/attendance/group/:groupId?date=2026-06-24`
- `PATCH /api/attendance/student/:studentId/toggle` (body: `{ groupId, date }`)

## Keyingi qadamlar (roadmap'dagi 6-8 bosqichlar)

1. Umumiy dashboard statistikasi (barcha guruhlar bo'yicha jami summalar, grafik)
2. Telegram bot orqali qarzdorlar va ertangi darslar haqida bildirishnoma
3. Railway (backend) + Vercel (frontend) ga deploy qilish