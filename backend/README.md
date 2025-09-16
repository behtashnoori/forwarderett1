# Backend Setup

## Run (dev)
```bash
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r backend/requirements.txt
```

## Environment
فایل `.env` را می‌توانید در ریشهٔ مخزن یا در `backend/.env` بسازید (دومی در صورت وجود اولویت دارد):
```env
DATABASE_URL=postgresql+psycopg2://postgres:bagheri13@127.0.0.1:5432/forwarder_db
CORS_ORIGIN=http://localhost:5173
SLA_HOURS=2
```

## Run
```bash
flask --app backend.app run
```

## Smoke tests
```bash
curl http://127.0.0.1:5000/api/health
curl http://127.0.0.1:5000/api/debug/geo-check
curl "http://127.0.0.1:5000/api/geo/provinces?q=تهران&limit=10"
```
