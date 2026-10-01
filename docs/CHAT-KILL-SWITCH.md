# کلید سراسری توقف چت (GUEST_CHAT_ENABLED)

حالت Incident: از پنل ادمین > تنظیمات، سوئیچ «چت مهمان و میزبان» را خاموش کنید.

## وقتی خاموش است
- ساخت چت جدید (`POST /chat`) رد می‌شود (`CHAT13`).
- ارسال پیام/فایل برای مهمان **و** میزبان رد می‌شود (`CHAT13` / HTTP 403).
- آپلود `POST /attachments?type=CHAT` پیش از ذخیره در S3 رد می‌شود (`CHAT13` / HTTP 403).
- پیامک یادآوری صف‌شده به میزبان ارسال نمی‌شود.
- خواندن لیست چت‌ها و تاریخچه آزاد است (فقط‌خواندنی)؛ حذف پیام نیز رد می‌شود تا شواهد گفتگو حفظ شوند.
- `is_chat_enabled` در تک‌آگهی و کارت رزرو `false` برمی‌گردد و دکمه‌های چت پنهان می‌شوند.
- `GET /chat/:id` فیلد `is_chat_suspended` را برمی‌گرداند و فرانت به‌جای ورودی، بنر نشان می‌دهد.

## دیپلوی
- مایگریشن داده‌ای: `prisma/migrations/20261001120000_add_guest_chat_enabled_setting` (فقط یک INSERT در `settings`، idempotent). مقدار اولیه `0` است تا پس از deploy، چت به‌صورت fail-safe متوقف باشد. **اعمال نشده؛ در کنار بقیه مایگریشن‌ها یکجا اعمال شود.**
- تا قبل از اعمال، نبود ردیف یعنی «چت فعال» و رفتار فعلی تغییر نمی‌کند، اما سوئیچ در پنل دیده نمی‌شود.
- اعمال تغییر حداکثر ~۵ ثانیه طول می‌کشد (memo درون‌پروسسی؛ عمداً از کش یک‌ساعته استفاده نشده).

## کامپوننت‌ها
- Back: `setting/*` (کلید + `isGuestChatEnabled`)، `chat/shared-chat.service.ts`، `chat/roles/user/user.controller.ts`، `property/roles/user/user.service.ts`، `property-reserve/roles/user/user.service.ts`، `common/filter/http-exception.filter.ts`
- Panel: `app/settings/page.tsx`، `interfaces/schema.type.ts`
- Front: `components/chat/ChatFooter.tsx`، `components/properties/reserve/ReserveCard.tsx`، `api_services/chat/chat.interface.ts`، `utils/LocalStrings.ts`
