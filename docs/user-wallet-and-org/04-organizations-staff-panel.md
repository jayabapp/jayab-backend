# ۰۴ — سازمان‌ها در پنل کارشناس جایاب (Back + Panel)

**وابستگی:** RS-1.7 (فیلد `jayab_booking`) برای انتخاب آگهی‌های مجاز.
**خروجی:** ساخت و مدیریت سازمان، اطلاعات حقوقی برای فاکتور، قرارداد، تنظیمات (درصد تخفیف سازمانی، پرداخت ترکیبی، آگهی‌ها و شهرهای مجاز)، دعوت مدیر سازمان، تأیید سازمان، و داشبورد کارشناس (تصویر ۳).

---

## OW-4.1 — مدل

```prisma
model Organization {
  id                Int       @id @default(autoincrement())
  name              String
  national_id       String    @unique @db.VarChar(11)   // شناسهٔ ملی
  economic_code     String?   @db.VarChar(14)
  registration_no   String?
  address           String?
  postal_code       String?   @db.VarChar(10)
  phone             String?
  email             String?
  logo_id           Int?
  status            Int       @db.SmallInt              // 10 PENDING_REVIEW, 20 ACTIVE, 30 INACTIVE
  discount_percent  Int       @db.SmallInt              // 0..50, e.g. 20 → pay 5M, employee gets 6M (method 1)
  gift_card_discount_percent Int @default(0) @db.SmallInt // suggested discount when this org buys physical gift cards, e.g. 12 (method 2, OW-3.4)
  combined_payment  Boolean   @default(true)            // org credit + personal wallet + gateway for the shortfall
  listing_scope     String    @db.VarChar(8)            // ALL (every eligible listing) | SELECTED
  city_scope        String    @db.VarChar(8)            // ALL | SELECTED
  contract_no       String?
  contract_start    DateTime? @db.Date
  contract_end      DateTime? @db.Date
  contract_file_id  Int?                                // private attachment
  note              String?
  created_by        Int
  created_at        DateTime  @default(now())
  updated_at        DateTime  @updatedAt
  @@index([status])
  @@map("organizations")
}

model OrganizationCity     { organization_id Int; city_id Int;     @@id([organization_id, city_id]);     @@map("organization_cities") }
model OrganizationProperty { organization_id Int; property_id Int; @@id([organization_id, property_id]); @@map("organization_properties") }

model OrganizationManager {
  id              Int       @id @default(autoincrement())
  organization_id Int
  mobile          String    @db.VarChar(11)
  full_name       String
  user_id         Int?                                  // set on first login
  invite_token    String?   @unique @db.VarChar(32)
  invite_expires  DateTime?
  status          Int       @db.SmallInt                // 10 INVITED, 20 ACTIVE, 30 REMOVED
  invited_by_type String    @db.VarChar(8)              // ADMIN | MANAGER
  invited_by_id   Int
  created_at      DateTime  @default(now())
  @@unique([organization_id, mobile])
  @@map("organization_managers")
}
```

**آگهی مجاز برای سازمان** (`isOrgEligibleProperty`)، یکجا در `Back/src/organization/common/` تعریف می‌شود:
- `jayab_booking = true` و `is_authorized = true`
- اگر `listing_scope = SELECTED`: در `OrganizationProperty` باشد
- اگر `city_scope = SELECTED`: `province_id` یا `city_id` آن در `OrganizationCity` باشد

این تابع در جستجوی کارمند (OW-07) و برنامهٔ خرج (OW-2.1) استفاده می‌شود.

---

## OW-4.2 — APIهای کارشناس (Back)

**پوشه:** `Back/src/organization/roles/admin/`، مسیر `admin/organizations` (ماژول `organizations`). همهٔ تغییرها لاگ ممیزی می‌شوند (HW-2.8). بدنهٔ درخواست‌ها شبا ندارد، ولی کد ملی مدیر هم ماسک می‌شود.

| متد | مسیر | کار |
| --- | --- | --- |
| GET | `/admin/organizations/summary` | KPIهای تصویر ۳: تعداد سازمان فعال، کل کارکنان، جمع پرداخت سازمان‌ها، جمع اعتبار شارژشده (با تخفیف)، مصرف و مانده |
| GET | `/admin/organizations?status=&q=` | فهرست: نام، شناسهٔ ملی، مدیر، کارکنان، پرداخت، اعتبار شارژشده، مصرف و وضعیت. جستجو روی نام، شناسهٔ ملی و موبایل مدیر. |
| POST | `/admin/organizations` | ساخت سازمان با اطلاعات حقوقی، تنظیمات و اولین مدیر `{ full_name, mobile }`. وضعیت اولیه `PENDING_REVIEW`. |
| GET | `/admin/organizations/:id` | جزئیات با برگه‌های اطلاعات کلی، کارکنان (فقط‌خواندنی، OW-05)، شارژها و فاکتورها (OW-06)، گزارش‌ها (OW-08) و مدیران |
| PATCH | `/admin/organizations/:id` | ویرایش اطلاعات و تنظیمات. تغییر `discount_percent` فقط روی سفارش‌های بعدی اثر دارد (E5). |
| PATCH | `/admin/organizations/:id/status` | بدنه `{ status }`. فعال‌سازی به این‌ها نیاز دارد: شناسهٔ ملی معتبر (۱۱ رقم)، `discount_percent` و دست‌کم یک مدیر. |
| PUT | `/admin/organizations/:id/properties` | بدنه `{ property_ids: [] }` برای `SELECTED`. هر آیدی باید `jayab_booking` و `is_authorized` باشد، وگرنه 422 با فهرست موارد نامعتبر. |
| PUT | `/admin/organizations/:id/cities` | بدنه `{ city_ids: [] }` |
| POST | `/admin/organizations/:id/managers` | دعوت مدیر (حداکثر ۵ نفر، E10) |
| POST | `/admin/organizations/:id/managers/:mid/resend` | ارسال دوبارهٔ لینک |
| DELETE | `/admin/organizations/:id/managers/:mid` | `REMOVED`. نمی‌توان آخرین مدیر فعال را حذف کرد. |

**دعوت مدیر:**
- `invite_token` ۲۴ حرف base62 از `crypto.randomBytes` با اعتبار ۷ روز.
- پیامک `ORG_MANAGER_INVITE` با لینک `{WEBSITE_URL}/org/invite/{token}` به زبان مدیر. زبان پیش‌فرض fa است، تا وقتی مدیر وارد شود و زبانش ذخیره شود.
- لینک فقط برای همان شماره کار می‌کند (OW-5.1).

**غیرفعال شدن سازمان:**
- مدیران نمی‌توانند وارد پنل شوند و شارژ جدید ممکن نیست.
- **اعتبار کارکنان تا انقضا قابل خرج می‌ماند**، چون حکم هدیه دارد (تصمیم کارفرما). فهرست آگهی‌های مجاز و `combined_payment` همان آخرین تنظیم سازمان است (OW-2.1).

---

## OW-4.3 — صفحه‌های Panel

**منو:** گروه «سازمانی» در `Panel/components/Sidebar/SidebarRowItems.tsx` با «سازمان‌ها» (`organizations`) و «کارت هدیه» (`gift-cards`، OW-03).

| مسیر | محتوا (مرجع: تصویر ۳ کارفرما) |
| --- | --- |
| `Panel/app/organizations/page.tsx` | دو کارت KPI (سازمان‌ها و کارت هدیه، با لینک «مشاهدهٔ جزئیات»)، فهرست سازمان‌ها با جستجو، فیلتر وضعیت و دکمهٔ «ثبت سازمان جدید». با کلیک روی ردیف، پنل جزئیات کنار فهرست باز می‌شود (مثل تصویر). |
| پنل جزئیات (`parts/OrganizationDetail.tsx`) | سربرگ با نام، نوع، لوگو، وضعیت و «ویرایش». برگه‌های اطلاعات کلی (شناسهٔ ملی، تاریخ قرارداد، مدیر، تلفن، ایمیل، توضیحات)، کارکنان، اعتبارات و گزارش‌ها. کارت «تنظیمات سازمان»: درصد تخفیف سازمانی، اقامتگاه‌های مجاز (تعداد)، پرداخت ترکیبی و دسترسی به همهٔ شهرها. |
| `Panel/app/organizations/create/page.tsx` و `edit/[id]/page.tsx` | فرم سه‌بخشی: اطلاعات حقوقی (برای فاکتور)، قرارداد (شماره، شروع، پایان، فایل) و تنظیمات |
| تنظیم «درصد تخفیف سازمانی» (روش اول، شارژ کیف پول) | دکمه‌های سریع ۱۰، ۱۵، ۲۰ و ۲۵٪، فیلد دلخواه ۰ تا ۵۰، و پیش‌نمایش زندهٔ «سازمان ۵٬۰۰۰٬۰۰۰ برای هر نفر می‌پردازد ← کارمند ۶٬۰۰۰٬۰۰۰ اعتبار می‌گیرد» |
| تنظیم «تخفیف خرید کارت هدیه» (روش دوم) | پیش‌فرض صفر، با پیش‌نمایش «۱۰ کارت ۵ میلیونی ← ۴۴٬۰۰۰٬۰۰۰ به جای ۵۰٬۰۰۰٬۰۰۰». هنگام ثبت فروش کارت (OW-3.4) پیشنهاد اولیه است و قابل تغییر. |
| `Panel/app/organizations/[id]/properties/page.tsx` | انتخاب آگهی‌های مجاز: جستجو و فیلتر شهر فقط روی آگهی‌های `jayab_booking` و احرازشده، تیک گروهی، شمارنده «اقامتگاه‌های مجاز: ۱۲۵۰ مورد»، و گزینهٔ «همهٔ آگهی‌های واجد شرایط» برای `listing_scope = ALL` |
| مدیران (برگه در جزئیات) | فهرست، دعوت، ارسال دوبارهٔ لینک، حذف، و دکمهٔ «کپی لینک پنل سازمان» |

**زبان و تم (XC-5):** namespace `organizations` در `Panel/dictionary/{fa,ar,en}.json`. model-props با `title_key` است و همهٔ صفحه‌ها در تم روشن و تاریک NextUI بررسی می‌شوند. شناسهٔ ملی، کد اقتصادی و موبایل LTR نمایش داده می‌شوند.

---

## معیار پذیرش فاز

- [ ] کارشناس ایران‌خودرو را با تخفیف ۲۰٪ و یک مدیر می‌سازد. لینک دعوت به زبان مدیر پیامک می‌شود و سازمان بعد از «فعال‌سازی» در فهرست فعال‌ها دیده می‌شود.
- [ ] افزودن آگهی اشتراکی یا احرازنشده به فهرست مجاز با 422 رد می‌شود.
- [ ] `isOrgEligibleProperty` با تست برای هر چهار ترکیب `listing_scope` و `city_scope`.
- [ ] تغییر درصد تخفیف در لاگ ممیزی قبل و بعد را دارد.
- [ ] نقشی که فقط `organizations` دارد، به ماژول‌های مالی و پشتیبانی خطای 403 می‌گیرد.
- [ ] همهٔ صفحه‌ها در سه زبان و دو تم (XC-7). Back و Panel: lint، build و test.
