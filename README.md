# Forwarderett — Local Development Guide

این مخزن شامل یک بک‌اند Flask (با PostgreSQL) و یک فرانت React/Vite برای انتخاب مبدأ/مقصد است.

## پیش‌نیازها

- Python 3.11+
- Node.js 20 و npm 10
- PostgreSQL در حال اجرا با دیتابیس حاوی جداول `province`، `county` و `city`

## تنظیم متغیرهای محیطی

### Backend (`backend/.env`)

یک فایل `.env` در پوشهٔ `backend/` (یا ریشهٔ ریپو) بسازید و مقادیر زیر را قرار دهید:

```env
DATABASE_URL=postgresql+psycopg2://postgres:bagheri13@127.0.0.1:5432/forwarderett
CORS_ORIGIN=http://localhost:5173
SLA_HOURS=2
```

### Frontend (`.env.local`)

فایل `.env.local` را در ریشهٔ پروژه ایجاد کنید (در گیت نادیده گرفته می‌شود):

```env
VITE_API_BASE=http://127.0.0.1:5000/api
```

## اجرای بک‌اند

```bash
python -m venv .venv
source .venv/bin/activate           # ویندوز: .\.venv\Scripts\Activate.ps1
pip install -r backend/requirements.txt
flask --app backend.app run
```

پس از اجرا، سرویس روی `http://127.0.0.1:5000` در دسترس است.

### تست سریع بک‌اند

```bash
curl http://127.0.0.1:5000/api/health
curl http://127.0.0.1:5000/api/debug/geo-check
curl "http://127.0.0.1:5000/api/geo/provinces?limit=5"
```

## اجرای فرانت

در ترمینال دوم:

```bash
npm install
npm run dev
```

سپس رابط روی `http://localhost:5173` در دسترس خواهد بود و درخواست‌ها را به بک‌اند (`VITE_API_BASE`) می‌فرستد.

## پذیرش

- `GET /api/health` مقدار `{ "ok": true }` برمی‌گرداند.
- `GET /api/debug/geo-check` باید `db_ok=true` و شمارش جداول مثبت داشته باشد.
- اندپوینت‌های `/api/geo/...` جست‌وجو و صفحه‌بندی را پشتیبانی می‌کنند.
- در فرانت، انتخاب مبدأ/مقصد از طریق typeahead کار می‌کند و داده‌ها از بک‌اند بارگذاری می‌شود.
