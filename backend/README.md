- venv را بساز و requirements نصب کن
- فایل .env را از روی .env.example بساز و پسورد و SLA_HOURS را تنظیم کن
- اجرای لوکال:
  flask --app backend.app run
- تست:
  curl "http://127.0.0.1:5000/api/geo/provinces?q=تهران&limit=20"

نکات:
- همهٔ پاسخ‌های خطا با ساختار JSON شامل فیلدهای `error` و `request_id` برمی‌گردند و در صورت نیاز جزئیات در `details` قرار می‌گیرد.
- در تمام پاسخ‌ها هدر `X-Request-ID` ست می‌شود.
- در ثبت درخواست حمل، طول `note_text` حداکثر ۱۴۰ کاراکتر است و قالب‌های ساده برای `contact_phone` و `contact_email` اعتبارسنجی می‌شوند.
