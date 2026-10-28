# ۰۴ — کیف پول میزبان (Back + Front)

**وابستگی:** HW-02 و HW-03.
**خروجی:** نمایش شفاف طلب و سوابق مالی میزبان، شامل چهار کارت خلاصه، بنر وضعیت حساب بانکی و لیست درآمد رزروها. **بدون امکان برداشت.**

---

## HW-4.1 — APIها (Back)

**پوشه:** `Back/src/wallet/roles/owner/wallet.controller.ts`، با گروه مسیر `owner/wallet` و گاردهای مالک.

| متد | مسیر | خروجی |
| --- | --- | --- |
| GET | `/api/v1/owner/wallet/summary` | `{ pending, available, processing, settled, on_hold, bank_status, settlement_blocked: 'BANK_NOT_VERIFIED' │ null, next_release_at }` |
| GET | `/api/v1/owner/wallet/earnings?cursor=` | لیست صفحه‌بندی‌شده به ازای هر رزرو (پایین) |
| GET | `/api/v1/owner/wallet/settlements/:id/receipt` | لینک موقت ۵ دقیقه‌ای رسید، فقط برای حوالهٔ تأییدشدهٔ خود میزبان |

- **مانده‌ها** از `WalletService.hostBalances(user.id)` (HW-2.2) گرفته می‌شوند. `VOID` نمایش داده نمی‌شود.
- **هر ردیف `earnings`:**

```ts
{
  reserve_id, reserve_code, property: { id, title },
  check_in, check_out, nights,
  guest_paid, fee_amount, host_amount,          // from the snapshot: fixed at payment time
  canceled: { refund_amount, host_amount } | null, // from ReserveCancellation, when there is one
  status: 'PENDING'│'AVAILABLE'│'ON_HOLD'│'PROCESSING'│'SETTLED'│'PARTIAL',
  release_at,
  settlement: { tracking_code, paid_on, has_receipt } | null   // only after SETTLED
}
```

- `status` از `reserveBalances` می‌آید. اگر موجودی در بیش از یک bucket باشد، `PARTIAL` است و جزئیات هر bucket هم برگردانده می‌شود.
- شمارهٔ پیگیری و رسید **فقط بعد از تأیید تسویه** برگردانده می‌شوند (سند، بند ۷). حوالهٔ `PROCESSING` فقط «در حال تسویه» نمایش داده می‌شود.
- کوئری با cursor روی `reserve_financial_snapshots` (ایندکس `host_user_id`) و صفحه‌های ۲۰تایی است. مانده‌ها با یک `groupBy` برای همان صفحه گرفته می‌شوند.

---

## HW-4.2 — صفحهٔ کیف پول (Front)

- **مسیر:** `Front/app/(profile)/profile/(owner)/owner/wallet/page.tsx`.
- **منو:** «کیف پول جایاب» در `Front/features/user/hooks/useProfileMenu.ts`، کنار «اطلاعات تسویه‌حساب».
- **ساختار** (مرجع چیدمان: بخش «کیف پول میزبان» در [Artifact](https://claude.ai/artifact/A4SqQ8eT37zewT9yyspNMs)، با ظاهر design system Front):
  1. **بنر وضعیت حساب بانکی:**
     - اگر `settlement_blocked = BANK_NOT_VERIFIED`: «تسویه متوقف تا تأیید حساب بانکی. درآمد رزروهای شما ثبت می‌شود اما تا تکمیل و تأیید اطلاعات بانکی واریزی انجام نمی‌شود.» با دکمهٔ «تکمیل اطلاعات تسویه».
     - اگر در انتظار بررسی است، بنر خنثی «اطلاعات بانکی شما در حال بررسی است».
  2. **چهار کارت خلاصه** به ترتیب سند: در انتظار تسویه، قابل تسویه، در حال تسویه و تسویه‌شده. هر کارت مبلغ و یک توضیح کوتاه از سند دارد. اگر `on_hold > 0` بود، یک سطر جدا «متوقف برای بررسی: {مبلغ}» زیر کارت‌ها نمایش داده شود. «در انتظار تسویه» تاریخ آزادسازی بعدی را هم نشان دهد.
  3. **لیست درآمد رزروها** با ستون‌های سند، بند ۷:

| ستون | محتوا |
| --- | --- |
| کد رزرو و اقامتگاه | با لینک به جزئیات همان رزرو در رزروهای مالک |
| تاریخ اقامت | ورود، خروج و تعداد شب |
| مبلغ کل و سهم جایاب | مبالغ قطعی‌شده در زمان پرداخت |
| سهم میزبان | مبلغ طلب. اگر لغو شده، مبلغ قبلی خط‌خورده و مبلغ جدید با برچسب «لغو طبق قانون کنسلی». |
| وضعیت تسویه | chip با رنگ هر bucket |
| شمارهٔ پیگیری و رسید | فقط بعد از تسویه |

     در دسکتاپ جدول است و در موبایل کارت. صفحه‌بندی بی‌نهایت با الگوی `OwnerReservationList` است.
- **قواعد سند (بند ۹):**
  - هیچ دکمهٔ «برداشت وجه» ساخته نشود.
  - هیچ‌جا عبارت «شارژ» استفاده نشود. عنوان لیست «ثبت طلب در کیف پول جایاب» است.
  - **میزبانی که هیچ طلبی ندارد:** حالت خالی «درآمد رزروهایی که از طریق جایاب پرداخت می‌شوند اینجا ثبت می‌شود. برای آگهی‌های دارای اشتراک و رزرو مستقیم، درآمد رزرو در این کیف پول ثبت نمی‌شود.»
- **API:** `Front/api_services/wallet/wallet.service.ts` با `apiCall`، hookهای `useWalletSummary` و `useWalletEarnings` در `Front/features/wallet/hooks/` با react-query مثل `features/reservations/api`.
- **متن‌ها:** namespace `wallet` در `Front/messages/{fa,ar,en}.json`. اعداد با فرمت‌کنندهٔ موجود پروژه.

---

## HW-4.3 — اتصال از رزروهای مالک

کارت رزرو ۹۰ در رزروهای مالک (RS-4.2) سطر «سهم شما در کیف پول جایاب ثبت شد · {وضعیت}» و لینک به `/profile/owner/wallet` داشته باشد. وضعیت از `owner.service` بستهٔ پشتیبانی با فیلد `wallet_status` برمی‌گردد که از `reserveBalances` محاسبه می‌شود.

---

## معیار پذیرش فاز

- [ ] بعد از یک رزرو پرداخت‌شده، کارت «در انتظار تسویه» مبلغ ۸۰٪ را با تاریخ آزادسازی نمایش می‌دهد و بعد از آزادسازی به «قابل تسویه» می‌رود.
- [ ] بنر توقف تسویه تا تأیید شبا نمایش داده می‌شود.
- [ ] شمارهٔ پیگیری فقط بعد از تأیید تسویه دیده می‌شود و رسید فقط برای خود میزبان باز می‌شود.
- [ ] هیچ دکمهٔ برداشت و هیچ عبارت «شارژ» در صفحه نیست.
- [ ] میزبان دیگر به `GET /owner/wallet/settlements/:id/receipt` حوالهٔ کس دیگری خطای 403 می‌گیرد.
- [ ] fa، ar و en، روشن و تاریک، ۳۶۰ و ۱۲۸۰ پیکسل. Front: lint و build.
