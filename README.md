# 📚 Repetitor CRM

> Xususiy o'qituvchilar va repetitorlar uchun mo'ljallangan zamonaviy CRM tizimi — guruhlar, o'quvchilar, to'lovlar va davomatni bir joyda boshqaring.

---

## ✨ Asosiy imkoniyatlar

- 🔐 **Autentifikatsiya** — JWT access + refresh token, xavfsiz ro'yxatdan o'tish va kirish
- 👥 **Guruh boshqaruvi** — guruh yaratish, dars kunlari va vaqtini belgilash, oylik narxni kiritish
- 🎓 **O'quvchi boshqaruvi** — guruhga o'quvchi qo'shish, tahrirlash, o'chirish
- 💰 **To'lov kuzatuvi** — har oy uchun to'lov holati (to'lagan / qarzdor), guruh bo'yicha umumiy statistika
- 📅 **Davomat kalendari** — dars kunlari kalendardan ko'rinadi, har bir kunga keldi/kelmadi belgilanadi
- 📊 **Dashboard statistika** — kutilayotgan summa, yig'ilgan summa, qarzdorlar soni
- 🌙 **Dark / Light mode** — tema almashtirish imkoniyati

---

## 🛠 Texnologiyalar

### Backend
| Texnologiya | Maqsad |
|---|---|
| Node.js + Express | Server va API |
| TypeORM (EntitySchema) | ORM, JavaScript bilan |
| PostgreSQL | Ma'lumotlar bazasi |
| JWT (jsonwebtoken) | Autentifikatsiya |
| bcryptjs | Parolni shifrlash |

### Frontend
| Texnologiya | Maqsad |
|---|---|
| React 18 | UI framework |
| Vite | Build tool |
| React Router v6 | Routing |
| Axios | HTTP so'rovlar |
| Tailwind CSS v3 | Asosiy uslublar |
| Plus Jakarta Sans + Inter | Tipografiya |

### Deploy
| Xizmat | Maqsad |
|---|---|
| Railway | Backend hosting |
| Vercel | Frontend hosting |
| PostgreSQL (Railway) | Cloud database |

## 🚀 Lokal ishga tushirish

### 1. Repositoryni klonlash

```bash
git clone https://github.com/egamberd1yev/repetitor-crm.git
cd repetitor-crm
```

### 2. Backend sozlash

```bash
cd backend
npm install
cp .env.example .env
```

`.env` faylini to'ldiring:

```env
PORT=5000
DATABASE_URL=postgresql://postgres:PAROL@localhost:5432/repetitor_crm
JWT_SECRET=uzun_maxfiy_kalit_bu_yerga
JWT_REFRESH_SECRET=boshqa_uzun_maxfiy_kalit
NODE_ENV=development
```

PostgreSQL da database yarating:

```sql
CREATE DATABASE repetitor_crm;
```

Serverni ishga tushiring:

```bash
npm run dev
```

> ✅ Server `http://localhost:5000` da ishga tushadi. TypeORM `synchronize: true` rejimida jadvallarni avtomatik yaratadi.

### 3. Frontend sozlash

```bash
cd ../frontend
npm install
cp .env.example .env
```

`.env` faylini to'ldiring:

```env
VITE_API_URL=http://localhost:5000/api
```

Frontendni ishga tushiring:

```bash
npm run dev
```

> ✅ Frontend `http://localhost:5173` da ochiladi.

---

## 📡 API Endpointlar

### Autentifikatsiya
```
POST   /api/auth/register       # Ro'yxatdan o'tish
POST   /api/auth/login          # Kirish
POST   /api/auth/refresh        # Tokenni yangilash
```

### Guruhlar `🔒 Token kerak`
```
GET    /api/groups              # Barcha guruhlarni olish
POST   /api/groups              # Yangi guruh yaratish
GET    /api/groups/:id          # Bitta guruhni olish
PUT    /api/groups/:id          # Guruhni tahrirlash
DELETE /api/groups/:id          # Guruhni o'chirish
```

### O'quvchilar `🔒 Token kerak`
```
GET    /api/students/group/:groupId     # Guruh o'quvchilari
POST   /api/students/group/:groupId     # O'quvchi qo'shish
PUT    /api/students/:id                # O'quvchini tahrirlash
DELETE /api/students/:id                # O'quvchini o'chirish
```

### To'lovlar `🔒 Token kerak`
```
PATCH  /api/payments/student/:studentId/toggle     # To'lov holatini almashtirish
GET    /api/payments/group/:groupId/summary        # Guruh oylik statistikasi
```

### Davomat `🔒 Token kerak`
```
GET    /api/attendance/group/:groupId              # Sana bo'yicha davomat ro'yxati
PATCH  /api/attendance/student/:studentId/toggle   # Keldi/kelmadi almashtirish
```

---

## 🗄 Ma'lumotlar bazasi sxemasi

```
Teacher ──< Group ──< Student ──< Payment
                  └──< Attendance
```

| Jadval | Asosiy maydonlar |
|---|---|
| `teachers` | id, fullName, email, password, phone, refreshToken |
| `groups` | id, name, lessonTime, monthlyPrice, scheduleDays[], teacherId |
| `students` | id, fullName, phone, groupId |
| `payments` | id, month, status, amount, paidAt, studentId |
| `attendances` | id, date, status, studentId, groupId |

---

## 🌐 Deploy qilish

### Backend → Railway

1. [railway.app](https://railway.app) da yangi loyiha yarating
2. GitHub reponi ulang
3. PostgreSQL plugin qo'shing
4. Environment variables kiriting:
   ```
   DATABASE_URL=railway postgresql ulanish manzili
   JWT_SECRET=...
   JWT_REFRESH_SECRET=...
   NODE_ENV=production
   PORT=5000
   ```
5. Deploy avtomatik boshlanadi

### Frontend → Vercel

1. [vercel.com](https://vercel.com) da import qiling
2. `frontend` papkasini root directory sifatida tanlang
3. Environment variable qo'shing:
   ```
   VITE_API_URL=https://sizning-railway-url.railway.app/api
   ```
4. Deploy!

---

## 🔮 Keyingi rejalar

- [ ] Telegram bot integratsiyasi — qarzdorlar va darslar haqida bildirishnoma
- [ ] O'quvchi profili sahifasi — to'liq tarix, davomat foizi
- [ ] Excel eksport — oylik hisobot yuklab olish
- [ ] Ko'p o'qituvchi (SaaS) — har biri o'z hisobi bilan
- [ ] Mobile responsive dizayn
- [ ] Click / Payme to'lov integratsiyasi

---

## 👨‍💻 Muallif

**Jo'rabek Egamberdiyev**

[![GitHub](https://img.shields.io/badge/GitHub-egamberd1yev-181717?style=flat&logo=github)](https://github.com/egamberd1yev)
[![Telegram](https://img.shields.io/badge/Telegram-@Egamberdiyev__J-2CA5E0?style=flat&logo=telegram)](https://t.me/Egamberdiyev_J)

---

## 📄 Litsenziya

MIT © 2026 Jo'rabek Egamberdiyev