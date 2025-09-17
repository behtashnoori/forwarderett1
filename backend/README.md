# Backend Setup

این سرویس Flask فقط روت‌های جغرافیایی و ثبت درخواست را فراهم می‌کند و از PostgreSQL استفاده می‌کند.

## Environment

1. فایل `.env` را از روی `.env.example` بسازید (می‌توانید در ریشه یا داخل `backend/` ایجاد کنید؛ در صورت وجود نسخهٔ داخل `backend/` اولویت دارد):

   ```env
   DATABASE_URL=postgresql+psycopg2://postgres:bagheri13@127.0.0.1:5432/forwarderett
   # مثال‌ها:
   # CORS_ORIGIN=http://localhost:5173
   # CORS_ORIGIN=http://localhost:8084,http://localhost:5173
   # CORS_ORIGIN=*
   CORS_ORIGIN=http://localhost:5173
   SLA_HOURS=2
   ```

2. مقادیر بالا هنگام راه‌اندازی توسط `python-dotenv` بارگذاری می‌شوند. مقدار `CORS_ORIGIN` می‌تواند یک آدرس، چند آدرس کاما جدا یا `*` باشد تا CORS فقط برای همان Originها (یا تمام Originها) روی مسیرهای `/api/*` فعال شود.

## Installation & Run (dev)

```bash
python -m venv venv
source venv/bin/activate      # ویندوز: .\.venv\Scripts\Activate.ps1 یا venv\Scripts\activate
pip install -r backend/requirements.txt
flask --app backend.app run
```

## Smoke tests

بعد از بالا آمدن سرور می‌توانید اتصال را بررسی کنید:

```bash
curl http://127.0.0.1:5000/api/health
curl http://127.0.0.1:5000/api/debug/geo-check
curl "http://127.0.0.1:5000/api/geo/provinces?q=تهران&limit=5"
```
