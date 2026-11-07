# پیوست: فهرست کامل endpointهای Back

تولیدشده از کنترلرهای `Back/src` در ۲۰۲۶/۱۱/۰۶. مجموع: 409 endpoint. ستون «محافظ» گارد احراز هویت است؛ «عمومی» یعنی بدون گارد (ممکن است درون متد شرط دیگری مثل کلید API داشته باشد).

## __base (17)

| متد | مسیر | محافظ | توضیح |
|---|---|---|---|
| GET | `/api/v1/admin/notifications` | AdminJwtGuard | Find All |
| POST | `/api/v1/admin/notifications` | AdminJwtGuard | Create |
| DELETE | `/api/v1/admin/notifications/:id` | AdminJwtGuard | Remove |
| GET | `/api/v1/admin/notifications/:id` | AdminJwtGuard | Find One |
| PUT | `/api/v1/admin/notifications/:id` | AdminJwtGuard | Update |
| PATCH | `/api/v1/admin/notifications/:id/update-partial` | AdminJwtGuard | Update Partial |
| GET | `/api/v1/admin/notifications/model-props` | AdminJwtGuard | Find model props |
| GET | `/api/v1/owner/notifications` | OwnerJwtGuard | Find All |
| POST | `/api/v1/owner/notifications` | OwnerJwtGuard | Create |
| DELETE | `/api/v1/owner/notifications/:baseId` | OwnerJwtGuard | Remove |
| GET | `/api/v1/owner/notifications/:baseId` | OwnerJwtGuard | Find One |
| PUT | `/api/v1/owner/notifications/:baseId` | OwnerJwtGuard | Update |
| GET | `/api/v1/user/notifications` | UserJwtGuard | Find All |
| POST | `/api/v1/user/notifications` | UserJwtGuard | Create |
| DELETE | `/api/v1/user/notifications/:baseId` | UserJwtGuard | Remove |
| GET | `/api/v1/user/notifications/:baseId` | UserJwtGuard | Find One |
| PUT | `/api/v1/user/notifications/:baseId` | UserJwtGuard | Update |

## access-control (14)

| متد | مسیر | محافظ | توضیح |
|---|---|---|---|
| GET | `/api/v1/admin/access-control/admins` | AdminJwtGuard | Find all admins |
| GET | `/api/v1/admin/access-control/admins/:adminId` | AdminJwtGuard | Find one admin |
| PUT | `/api/v1/admin/access-control/admins/:adminId` | AdminJwtGuard | Update admin |
| POST | `/api/v1/admin/access-control/admins/signup` | AdminJwtGuard | Signup admin |
| GET | `/api/v1/admin/access-control/modules` | AdminJwtGuard | Find all RBAC module |
| POST | `/api/v1/admin/access-control/modules` | AdminJwtGuard | Create RBAC module |
| POST | `/api/v1/admin/access-control/noitification-permissions` | AdminJwtGuard | Update notif permission for  |
| GET | `/api/v1/admin/access-control/noitification-permissions/:roleId` | AdminJwtGuard | Find notif permission selectable items |
| POST | `/api/v1/admin/access-control/rbac-list` | AdminJwtGuard | Create RBAC list |
| POST | `/api/v1/admin/access-control/rbac-list/:roleId` | AdminJwtGuard | Find the role RBAC list |
| GET | `/api/v1/admin/access-control/roles` | AdminJwtGuard | Find all RBAC role |
| POST | `/api/v1/admin/access-control/roles` | AdminJwtGuard | Create RBAC role |
| GET | `/api/v1/admin/access-control/roles/:roleId` | AdminJwtGuard | Find one RBAC role |
| PUT | `/api/v1/admin/access-control/roles/:roleId` | AdminJwtGuard | Update one RBAC role |

## admin-panel (7)

| متد | مسیر | محافظ | توضیح |
|---|---|---|---|
| POST | `/api/v1/admin/admin-report` | AdminJwtGuard | Find all |
| POST | `/api/v1/admin/admin-report/commission` | AdminJwtGuard | Commission |
| POST | `/api/v1/admin/admin-report/sale` | AdminJwtGuard | Sale |
| GET | `/api/v1/admin/dashboard` | AdminJwtGuard | Find all |
| GET | `/api/v1/admin/dashboard/business` | AdminJwtGuard | Find Dashboard for business |
| GET | `/api/v1/admin/dashboard/count` | AdminJwtGuard |  |
| GET | `/api/v1/admin/dashboard/sidebar-badge` | AdminJwtGuard | Find Badge For Sidebar |

## advisor (12)

| متد | مسیر | محافظ | توضیح |
|---|---|---|---|
| GET | `/api/v1/admin/advisors` | AdminJwtGuard | Create |
| POST | `/api/v1/admin/advisors` | AdminJwtGuard | Create |
| DELETE | `/api/v1/admin/advisors/:id` | AdminJwtGuard | Remove |
| GET | `/api/v1/admin/advisors/:id` | AdminJwtGuard | Find One |
| PUT | `/api/v1/admin/advisors/:id` | AdminJwtGuard | Update |
| PATCH | `/api/v1/admin/advisors/:id/update-partial` | AdminJwtGuard | Update Partial |
| GET | `/api/v1/admin/advisors/excel` | AdminJwtGuard | Get Excel |
| GET | `/api/v1/admin/advisors/model-props` | AdminJwtGuard | Find model props |
| GET | `/api/v1/user/advisors` | عمومی | Find All |
| GET | `/api/v1/user/advisors/:advisorId` | UserJwtGuard | Find One |
| POST | `/api/v1/user/advisors/:advisorId/rate/add` | UserJwtGuard | Add rate |
| POST | `/api/v1/user/advisors/:advisorId/rate/init` | UserJwtGuard | Init rate |

## attachment (5)

| متد | مسیر | محافظ | توضیح |
|---|---|---|---|
| POST | `/api/v1/admin/attachments` | AdminJwtGuard | ADMIN - Create attachment |
| DELETE | `/api/v1/admin/attachments/:id` | AdminJwtGuard | ADMIN - Delete attachment |
| POST | `/api/v1/admin/attachments/video` | AdminJwtGuard | Upload video |
| POST | `/api/v1/attachments` | UserJwtGuard |  |
| GET | `/api/v1/attachments/:id/download` | عمومی | Download a public property image as WebP |

## auth (8)

| متد | مسیر | محافظ | توضیح |
|---|---|---|---|
| GET | `/api/v1/admin/auth/init-settings` | AdminJwtGuard | Get Init Settings |
| POST | `/api/v1/admin/auth/signin` | AuthThrottlerGuard | Signin admin |
| POST | `/api/v1/admin/auth/two-step-verification` | AdminAuthJwtGuard, AuthThrottlerGuard | Check otp code |
| GET | `/api/v1/admin/auth/validate-edit-mode` | AdminJwtGuard | Validate site edit mode |
| GET | `/api/v1/auth/init-settings` | عمومی | Get Init Settings |
| GET | `/api/v1/auth/init-user` | UserJwtGuard | Get Init User |
| POST | `/api/v1/auth/otp` | AuthThrottlerGuard | Create OTP code |
| POST | `/api/v1/auth/otp/verify` | AuthThrottlerGuard | Verify OTP code |

## banner (9)

| متد | مسیر | محافظ | توضیح |
|---|---|---|---|
| GET | `/api/v1/admin/banners` | AdminJwtGuard | Find All |
| POST | `/api/v1/admin/banners` | AdminJwtGuard | Create |
| DELETE | `/api/v1/admin/banners/:id` | AdminJwtGuard | Remove |
| GET | `/api/v1/admin/banners/:id` | AdminJwtGuard | Find One |
| PUT | `/api/v1/admin/banners/:id` | AdminJwtGuard | Update |
| GET | `/api/v1/admin/banners/model-props` | AdminJwtGuard | Find model props |
| GET | `/api/v1/banners` | عمومی | Find All |
| GET | `/api/v1/banners` | عمومی |  |
| PATCH | `/api/v1/banners/:bannerId` | عمومی | Update view count |

## bookmark (3)

| متد | مسیر | محافظ | توضیح |
|---|---|---|---|
| GET | `/api/v1/user/bookmarks` | UserJwtGuard | Find All |
| POST | `/api/v1/user/bookmarks` | UserJwtGuard | Create |
| GET | `/api/v1/user/bookmarks/property-ids` | UserJwtGuard | Find All Property ids |

## call-log (2)

| متد | مسیر | محافظ | توضیح |
|---|---|---|---|
| GET | `/api/v1/admin/call-logs` | AdminJwtGuard | Find All |
| GET | `/api/v1/admin/call-logs/model-props` | AdminJwtGuard | Find model props |

## category (17)

| متد | مسیر | محافظ | توضیح |
|---|---|---|---|
| GET | `/api/v1/admin/categories` | AdminJwtGuard | Find all categories |
| GET | `/api/v1/admin/categories` | AdminJwtGuard | Find all categories |
| POST | `/api/v1/admin/categories` | AdminJwtGuard | Create |
| DELETE | `/api/v1/admin/categories/:categoryId` | AdminJwtGuard | Delete |
| GET | `/api/v1/admin/categories/:categoryId` | AdminJwtGuard | Find one category |
| PUT | `/api/v1/admin/categories/:categoryId` | AdminJwtGuard | Update |
| GET | `/api/v1/admin/categories/cascade` | AdminJwtGuard | Cascade |
| GET | `/api/v1/admin/categories/last-levels` | AdminJwtGuard | Find Last Level Categories |
| GET | `/api/v1/admin/categories/model-props` | AdminJwtGuard | Find model props |
| GET | `/api/v1/admin/categories/parents` | AdminJwtGuard | Find all parents |
| GET | `/api/v1/admin/categories/parents-with-query` | AdminJwtGuard | Find All Parents |
| GET | `/api/v1/admin/categories/parents/:parentId` | AdminJwtGuard | Find all children by parent id |
| GET | `/api/v1/categories` | عمومی | Find Childs |
| GET | `/api/v1/categories/:id` | عمومی | Find one |
| GET | `/api/v1/categories/cascade` | عمومی | Find Cascade |
| GET | `/api/v1/categories/filter` | عمومی | Filter |
| GET | `/api/v1/categories/parents` | عمومی | Find all parents |

## chat (9)

| متد | مسیر | محافظ | توضیح |
|---|---|---|---|
| GET | `/api/v1/chat` | UserJwtGuard | Find All |
| POST | `/api/v1/chat` | UserJwtGuard | Create Or Find Chatroom |
| GET | `/api/v1/chat/:chatroomId` | UserJwtGuard | Find one |
| POST | `/api/v1/chat/:chatroomId/blacklist` | UserJwtGuard | Black List |
| GET | `/api/v1/chat/:chatroomId/messages` | UserJwtGuard | Find messages |
| DELETE | `/api/v1/chat/:chatroomId/messages/:messageId` | UserJwtGuard | Delete message |
| PATCH | `/api/v1/chat/:chatroomId/read-at` | UserJwtGuard | Update read at |
| POST | `/api/v1/chat/:chatroomId/send-message` | UserJwtGuard | Send message |
| GET | `/api/v1/chat/unread/count` | UserJwtGuard | Unread messages count |

## city (12)

| متد | مسیر | محافظ | توضیح |
|---|---|---|---|
| GET | `/api/v1/admin/cities` | AdminJwtGuard | Find all categories |
| POST | `/api/v1/admin/cities` | AdminJwtGuard | Create |
| DELETE | `/api/v1/admin/cities/:cityId` | AdminJwtGuard | Delete |
| GET | `/api/v1/admin/cities/:cityId` | AdminJwtGuard | Find one city |
| PUT | `/api/v1/admin/cities/:cityId` | AdminJwtGuard | Update |
| GET | `/api/v1/admin/cities/cascade` | AdminJwtGuard | Find all cascade |
| GET | `/api/v1/admin/cities/last-levels` | AdminJwtGuard | Find Last Level Categories |
| GET | `/api/v1/admin/cities/model-props` | AdminJwtGuard | Find model props |
| GET | `/api/v1/admin/cities/parents` | AdminJwtGuard | Find all parents |
| GET | `/api/v1/admin/cities/parents/:parentId` | AdminJwtGuard | Find all children by parent id |
| GET | `/api/v1/cities` | عمومی | Find All |
| GET | `/api/v1/cities/:parentId` | عمومی | Find children |

## client (1)

| متد | مسیر | محافظ | توضیح |
|---|---|---|---|
| GET | `/api/v1/client/mobile-exist` | عمومی | Check Mobile Is Exist |

## content (12)

| متد | مسیر | محافظ | توضیح |
|---|---|---|---|
| GET | `/api/v1/admin/contents` | AdminJwtGuard | Find All |
| POST | `/api/v1/admin/contents` | AdminJwtGuard | Create |
| DELETE | `/api/v1/admin/contents/:id` | AdminJwtGuard | Remove |
| GET | `/api/v1/admin/contents/:id` | AdminJwtGuard | Find One |
| PUT | `/api/v1/admin/contents/:id` | AdminJwtGuard | Update |
| GET | `/api/v1/admin/contents/model-props` | AdminJwtGuard | Find model props |
| GET | `/api/v1/contents` | عمومی | Find All |
| GET | `/api/v1/contents/:contentId` | عمومی | Find One |
| GET | `/api/v1/contents/by-key/:contentKey` | عمومی | Find One by key |
| GET | `/api/v1/contents/by-slug/:slug` | عمومی | Find One By Slug |
| GET | `/api/v1/contents/category/:categoryKey` | عمومی |  |
| GET | `/api/v1/contents/category/by-slug/:categorySlug` | عمومی |  |

## content-category (8)

| متد | مسیر | محافظ | توضیح |
|---|---|---|---|
| GET | `/api/v1/admin/content-categories` | AdminJwtGuard | Find All |
| POST | `/api/v1/admin/content-categories` | AdminJwtGuard | Create |
| DELETE | `/api/v1/admin/content-categories/:id` | AdminJwtGuard | Remove |
| GET | `/api/v1/admin/content-categories/:id` | AdminJwtGuard | Find One |
| PUT | `/api/v1/admin/content-categories/:id` | AdminJwtGuard | Update |
| POST | `/api/v1/admin/content-categories/:id/dynamic-fields` | AdminJwtGuard | Update Dynamic fields |
| DELETE | `/api/v1/admin/content-categories/:id/dynamic-fields/:key` | AdminJwtGuard | Update Dynamic fields |
| GET | `/api/v1/admin/content-categories/model-props` | AdminJwtGuard | Find model props |

## content-question (9)

| متد | مسیر | محافظ | توضیح |
|---|---|---|---|
| GET | `/api/v1/admin/content-questions` | AdminJwtGuard | Find All |
| POST | `/api/v1/admin/content-questions` | AdminJwtGuard | Create |
| DELETE | `/api/v1/admin/content-questions/:id` | AdminJwtGuard | Remove |
| GET | `/api/v1/admin/content-questions/:id` | AdminJwtGuard | Find One |
| PUT | `/api/v1/admin/content-questions/:id` | AdminJwtGuard | Update |
| GET | `/api/v1/admin/content-questions/model-props` | AdminJwtGuard | Find model props |
| GET | `/api/v1/content-questions` | عمومی | Find All |
| POST | `/api/v1/content-questions` | عمومی | Create |
| GET | `/api/v1/content-questions/rate` | عمومی | Rate |

## favorite (3)

| متد | مسیر | محافظ | توضیح |
|---|---|---|---|
| GET | `/api/v1/user/favorites` | UserJwtGuard | Find All |
| POST | `/api/v1/user/favorites` | UserJwtGuard | Create |
| GET | `/api/v1/user/favorites/property-ids` | UserJwtGuard | Find All |

## firebase (1)

| متد | مسیر | محافظ | توضیح |
|---|---|---|---|
| POST | `/api/v1/admin/fcm` | AdminJwtGuard |  |

## form-builder (7)

| متد | مسیر | محافظ | توضیح |
|---|---|---|---|
| GET | `/api/v1/admin/form-builder` | AdminJwtGuard | Find All |
| POST | `/api/v1/admin/form-builder` | AdminJwtGuard | Create |
| DELETE | `/api/v1/admin/form-builder/:id` | AdminJwtGuard | Remove |
| GET | `/api/v1/admin/form-builder/:id` | AdminJwtGuard | Find One |
| PUT | `/api/v1/admin/form-builder/:id` | AdminJwtGuard | Update |
| PATCH | `/api/v1/admin/form-builder/:id/update-partial` | AdminJwtGuard | Update Partial |
| GET | `/api/v1/admin/form-builder/model-props` | AdminJwtGuard | Find model props |

## health.controller.ts (1)

| متد | مسیر | محافظ | توضیح |
|---|---|---|---|
| GET | `/api/v1/health` | عمومی | Health Check |

## landing-page (10)

| متد | مسیر | محافظ | توضیح |
|---|---|---|---|
| GET | `/api/v1/admin/landing-pages` | AdminJwtGuard | Find All |
| POST | `/api/v1/admin/landing-pages` | AdminJwtGuard | Create |
| DELETE | `/api/v1/admin/landing-pages/:id` | AdminJwtGuard | Remove |
| GET | `/api/v1/admin/landing-pages/:id` | AdminJwtGuard | Find One |
| PUT | `/api/v1/admin/landing-pages/:id` | AdminJwtGuard | Update |
| PATCH | `/api/v1/admin/landing-pages/:id/update-partial` | AdminJwtGuard | Update Partial |
| GET | `/api/v1/admin/landing-pages/model-props` | AdminJwtGuard | Find model props |
| GET | `/api/v1/user/landing-pages` | عمومی | Find All |
| GET | `/api/v1/user/landing-pages/:landingPageUrl` | عمومی | Find One |
| GET | `/api/v1/user/landing-pages/resolve/location` | عمومی |  |

## messenger-chatroom (7)

| متد | مسیر | محافظ | توضیح |
|---|---|---|---|
| GET | `/api/v1/admin/messenger-chatrooms` | AdminJwtGuard | Find All |
| POST | `/api/v1/admin/messenger-chatrooms` | AdminJwtGuard | Create |
| DELETE | `/api/v1/admin/messenger-chatrooms/:id` | AdminJwtGuard | Remove |
| GET | `/api/v1/admin/messenger-chatrooms/:id` | AdminJwtGuard | Find One |
| PUT | `/api/v1/admin/messenger-chatrooms/:id` | AdminJwtGuard | Update |
| PATCH | `/api/v1/admin/messenger-chatrooms/:id/update-partial` | AdminJwtGuard | Update Partial |
| GET | `/api/v1/admin/messenger-chatrooms/model-props` | AdminJwtGuard | Find model props |

## messenger-messages (4)

| متد | مسیر | محافظ | توضیح |
|---|---|---|---|
| GET | `/api/v1/admin/messenger-messages` | AdminJwtGuard | Find All |
| GET | `/api/v1/admin/messenger-messages/:id` | AdminJwtGuard | Find One |
| GET | `/api/v1/admin/messenger-messages/excel` | AdminJwtGuard | Get Excel |
| GET | `/api/v1/admin/messenger-messages/model-props` | AdminJwtGuard | Find model props |

## notification (10)

| متد | مسیر | محافظ | توضیح |
|---|---|---|---|
| GET | `/api/v1/admin/notifications` | AdminJwtGuard | Find all |
| POST | `/api/v1/admin/notifications` | AdminJwtGuard | Create |
| DELETE | `/api/v1/admin/notifications/:id` | AdminJwtGuard | Delete |
| GET | `/api/v1/admin/notifications/badge` | AdminJwtGuard | Badge count |
| GET | `/api/v1/admin/notifications/model-props` | AdminJwtGuard | Find model props |
| PATCH | `/api/v1/admin/notifications/seen-all` | AdminJwtGuard | Update seen all |
| PATCH | `/api/v1/admin/notifications/seen-at/:notifId` | AdminJwtGuard | Update seen at |
| GET | `/api/v1/admin/notifications/sent` | AdminJwtGuard | Find All Sent |
| GET | `/api/v1/user/notifications` | UserJwtGuard | Find All |
| GET | `/api/v1/user/notifications/badge` | UserJwtGuard | Badge count |

## owner (11)

| متد | مسیر | محافظ | توضیح |
|---|---|---|---|
| GET | `/api/v1/admin/owners` | AdminJwtGuard | Find All |
| POST | `/api/v1/admin/owners` | AdminJwtGuard | Create |
| DELETE | `/api/v1/admin/owners/:id` | AdminJwtGuard | Remove |
| GET | `/api/v1/admin/owners/:id` | AdminJwtGuard | Find One |
| PUT | `/api/v1/admin/owners/:id` | AdminJwtGuard | Update |
| PATCH | `/api/v1/admin/owners/:id/update-partial` | AdminJwtGuard | Update Partial |
| GET | `/api/v1/admin/owners/excel` | AdminJwtGuard | Get Excel |
| GET | `/api/v1/admin/owners/model-props` | AdminJwtGuard | Find model props |
| GET | `/api/v1/user/owners` | UserJwtGuard |  |
| POST | `/api/v1/user/owners` | UserJwtGuard |  |
| DELETE | `/api/v1/user/owners/:ownerId` | UserJwtGuard | Remove |

## page-seo-analyze (6)

| متد | مسیر | محافظ | توضیح |
|---|---|---|---|
| GET | `/api/v1/admin/page-seo-analyzes` | AdminJwtGuard | Find All |
| GET | `/api/v1/admin/page-seo-analyzes/:id` | AdminJwtGuard | Find One |
| GET | `/api/v1/admin/page-seo-analyzes/model-props` | AdminJwtGuard | Find model props |
| GET | `/api/v1/admin/page-seo-analyzes/scrape` | AdminJwtGuard | Scrape |
| GET | `/api/v1/admin/page-seo-analyzes/scrape/all` | AdminJwtGuard | Scrape All |
| GET | `/api/v1/admin/page-seo-analyzes/sync-sitemap` | AdminJwtGuard | Sync Sitemap |

## payment (1)

| متد | مسیر | محافظ | توضیح |
|---|---|---|---|
| GET | `/api/v1/payments/callback` | عمومی | Callback |

## payment-gateway (6)

| متد | مسیر | محافظ | توضیح |
|---|---|---|---|
| GET | `/api/v1/admin/payment-gateways` | AdminJwtGuard | Find All |
| GET | `/api/v1/admin/payment-gateways/:id` | AdminJwtGuard | Find One |
| PUT | `/api/v1/admin/payment-gateways/:id` | AdminJwtGuard | Update |
| PATCH | `/api/v1/admin/payment-gateways/:id/update-partial` | AdminJwtGuard | Update Partial |
| GET | `/api/v1/admin/payment-gateways/model-props` | AdminJwtGuard | Find model props |
| GET | `/api/v1/user/payment-gateways` | UserJwtGuard | Find All |

## peak-day (7)

| متد | مسیر | محافظ | توضیح |
|---|---|---|---|
| GET | `/api/v1/admin/peak-days` | AdminJwtGuard | Find All |
| POST | `/api/v1/admin/peak-days` | AdminJwtGuard | Create |
| DELETE | `/api/v1/admin/peak-days/:id` | AdminJwtGuard | Remove |
| GET | `/api/v1/admin/peak-days/:id` | AdminJwtGuard | Find One |
| PUT | `/api/v1/admin/peak-days/:id` | AdminJwtGuard | Update |
| PATCH | `/api/v1/admin/peak-days/:id/update-partial` | AdminJwtGuard | Update Partial |
| GET | `/api/v1/admin/peak-days/model-props` | AdminJwtGuard | Find model props |

## profile (12)

| متد | مسیر | محافظ | توضیح |
|---|---|---|---|
| GET | `/api/v1/admin/profile` | AdminJwtGuard | Find admin profile |
| GET | `/api/v1/admin/profile/rbac-list` | AdminJwtGuard | Find admin rbac list |
| GET | `/api/v1/profile` | UserJwtGuard | Get user profile |
| PUT | `/api/v1/profile` | UserJwtGuard | Update profile |
| GET | `/api/v1/profile/advisor` | UserJwtGuard | Get advisor profile |
| GET | `/api/v1/profile/owner` | UserJwtGuard | Get owner profile |
| DELETE | `/api/v1/profile/pay-plan` | UserJwtGuard | pay Advisor Subscription |
| POST | `/api/v1/profile/pay-plan` | UserJwtGuard | Pay Advisor Subscription |
| PATCH | `/api/v1/profile/profile-image` | UserJwtGuard | Update profile image |
| PUT | `/api/v1/profile/register/advisor` | UserJwtGuard | Register advisor |
| PUT | `/api/v1/profile/register/owner` | UserJwtGuard | Update profile |
| PATCH | `/api/v1/profile/update-fcm` | UserJwtGuard | Update fcm |

## property (56)

| متد | مسیر | محافظ | توضیح |
|---|---|---|---|
| GET | `/api/v1/admin/properties` | AdminJwtGuard | Find All |
| GET | `/api/v1/admin/properties/:id` | AdminJwtGuard | Find One |
| PATCH | `/api/v1/admin/properties/:id` | AdminJwtGuard | Update Status |
| PATCH | `/api/v1/admin/properties/:id/expire` | AdminJwtGuard | Expire Property |
| PUT | `/api/v1/admin/properties/:id/images` | AdminJwtGuard | Update Images |
| GET | `/api/v1/admin/properties/:id/sso` | AdminJwtGuard | Owner SSO |
| GET | `/api/v1/admin/properties/:id/translations` | AdminJwtGuard | Find translations (descriptions, host name, title, address) |
| PUT | `/api/v1/admin/properties/:id/translations` | AdminJwtGuard | Update translations (descriptions, host name, title, address) |
| GET | `/api/v1/admin/properties/excel` | AdminJwtGuard | Get Excel |
| GET | `/api/v1/admin/properties/mian/token` | AdminJwtGuard | Generate "Mian" API Token |
| POST | `/api/v1/admin/properties/migrate/attachments` | AdminJwtGuard | Migrate Attachments |
| POST | `/api/v1/admin/properties/migrate/convertToWebp` | AdminJwtGuard | Convert to webp |
| POST | `/api/v1/admin/properties/migrate/options` | AdminJwtGuard | Migrate options |
| POST | `/api/v1/admin/properties/migrate/owners` | AdminJwtGuard | Migrate Owners |
| POST | `/api/v1/admin/properties/migrate/properties` | AdminJwtGuard | Migrate Property |
| POST | `/api/v1/admin/properties/migrate/upload` | AdminJwtGuard | Upload Attachments |
| POST | `/api/v1/admin/properties/migrate/users` | AdminJwtGuard | Migrate Users |
| GET | `/api/v1/admin/properties/model-props` | AdminJwtGuard | Find model props |
| GET | `/api/v1/admin/properties/photo-upgrade-requests` | AdminJwtGuard | Find All Photo Upgrade Requests |
| GET | `/api/v1/admin/properties/photo-upgrade-requests/:requestId` | AdminJwtGuard | Find One Photo Upgrade Request |
| PATCH | `/api/v1/admin/properties/photo-upgrade-requests/:requestId/images/:itemId` | AdminJwtGuard | Update Photo Upgrade Request Image Status |
| POST | `/api/v1/mian/properties` | MianJwtGuard | Find Host Properties |
| POST | `/api/v1/mian/properties/webhooks/actions` | MianJwtGuard | Webhooks actions |
| GET | `/api/v1/owner/properties` | UserJwtGuard, OwnerGuard | Find All |
| DELETE | `/api/v1/owner/properties/:propertyId` | UserJwtGuard, OwnerGuard | Delete |
| GET | `/api/v1/owner/properties/:propertyId` | UserJwtGuard, OwnerGuard | Find One |
| PUT | `/api/v1/owner/properties/:propertyId` | UserJwtGuard, OwnerGuard | Create |
| PUT | `/api/v1/owner/properties/:propertyId/assistants` | UserJwtGuard, OwnerGuard | Update property: assistant |
| PUT | `/api/v1/owner/properties/:propertyId/bedroom` | UserJwtGuard, OwnerGuard | Update property: bedroom |
| PUT | `/api/v1/owner/properties/:propertyId/commission` | UserJwtGuard, OwnerGuard | Update Commission |
| PUT | `/api/v1/owner/properties/:propertyId/environment` | UserJwtGuard, OwnerGuard | Update property: environment |
| PUT | `/api/v1/owner/properties/:propertyId/facility` | UserJwtGuard, OwnerGuard | Update property: facility |
| PUT | `/api/v1/owner/properties/:propertyId/location` | UserJwtGuard, OwnerGuard | Update property: location |
| PUT | `/api/v1/owner/properties/:propertyId/media` | UserJwtGuard, OwnerGuard | Update property: media |
| GET | `/api/v1/owner/properties/:propertyId/month-calendar` | UserJwtGuard, OwnerGuard | Find One Calendar |
| PUT | `/api/v1/owner/properties/:propertyId/pay-subscription` | UserJwtGuard, OwnerGuard | Pay Subscription |
| PUT | `/api/v1/owner/properties/:propertyId/price` | UserJwtGuard, OwnerGuard | Update property: price |
| GET | `/api/v1/owner/properties/:propertyId/statistics` | UserJwtGuard, OwnerGuard | Find Statistics |
| PUT | `/api/v1/owner/properties/:propertyId/terms` | UserJwtGuard, OwnerGuard | Update property: terms |
| GET | `/api/v1/owner/properties/init` | UserJwtGuard, OwnerGuard | Get last init prop |
| GET | `/api/v1/user/properties` | عمومی | Find All |
| GET | `/api/v1/user/properties/:propertyId/advisor-share` | عمومی | Retrive Share Link Data |
| GET | `/api/v1/user/properties/:propertyId/advisor-share/link` | عمومی | Generate Advisor Share Link |
| GET | `/api/v1/user/properties/:propertyId/map-preview` | عمومی | Map Preview |
| GET | `/api/v1/user/properties/:propertyId/month-calendar` | عمومی | Find One Calendar |
| GET | `/api/v1/user/properties/:propertyId/quote` | عمومی | Quote |
| GET | `/api/v1/user/properties/:propertyId/reserved` | عمومی | Find Property Reserved Days |
| GET | `/api/v1/user/properties/:propertyId/similar` | عمومی | Find Similar Properties |
| PUT | `/api/v1/user/properties/:propertyId/view` | عمومی | Update View |
| GET | `/api/v1/user/properties/:propertySlug` | عمومی | Find One By Slug |
| GET | `/api/v1/user/properties/:propertySlug/contact-info` | UserJwtGuard | Find Contact Info |
| GET | `/api/v1/user/properties/map` | عمومی |  |
| GET | `/api/v1/user/properties/price-histogram` | عمومی |  |
| GET | `/api/v1/user/properties/search/extract` | عمومی | Search |
| GET | `/api/v1/user/properties/search/suggestions` | عمومی |  |
| GET | `/api/v1/user/properties/search/suggestions` | عمومی |  |

## property-authorize (9)

| متد | مسیر | محافظ | توضیح |
|---|---|---|---|
| GET | `/api/v1/admin/property-authorize` | AdminJwtGuard | Find All |
| GET | `/api/v1/admin/property-authorize/:id` | AdminJwtGuard | Find One |
| PUT | `/api/v1/admin/property-authorize/:id` | AdminJwtGuard | Update |
| PATCH | `/api/v1/admin/property-authorize/:id/status` | AdminJwtGuard | Update Partial |
| GET | `/api/v1/admin/property-authorize/model-props` | AdminJwtGuard | Find model props |
| GET | `/api/v1/owner/property-authorize` | UserJwtGuard, OwnerGuard | Find All |
| POST | `/api/v1/owner/property-authorize` | UserJwtGuard, OwnerGuard | Create |
| GET | `/api/v1/owner/property-authorize/:propertyId` | UserJwtGuard, OwnerGuard | Find One |
| PUT | `/api/v1/owner/property-authorize/:propertyId` | UserJwtGuard, OwnerGuard | Update |

## property-badge (7)

| متد | مسیر | محافظ | توضیح |
|---|---|---|---|
| GET | `/api/v1/admin/property-badges` | AdminJwtGuard | Find All |
| DELETE | `/api/v1/admin/property-badges/:id` | AdminJwtGuard | Remove |
| GET | `/api/v1/admin/property-badges/:id` | AdminJwtGuard | Find One |
| PATCH | `/api/v1/admin/property-badges/:id/status` | AdminJwtGuard | Update Partial |
| GET | `/api/v1/admin/property-badges/model-props` | AdminJwtGuard | Find model props |
| GET | `/api/v1/owner/properties/:propertyId/property-badges` | UserJwtGuard, OwnerGuard | Find One |
| POST | `/api/v1/owner/properties/:propertyId/property-badges` | UserJwtGuard, OwnerGuard | Create |

## property-calendar (8)

| متد | مسیر | محافظ | توضیح |
|---|---|---|---|
| GET | `/api/v1/owner/properties/:propertyId/calendar` | UserJwtGuard, OwnerGuard | Find All |
| POST | `/api/v1/owner/properties/:propertyId/calendar/commission` | UserJwtGuard, OwnerGuard | Update Advisor Commission |
| POST | `/api/v1/owner/properties/:propertyId/calendar/notes` | UserJwtGuard, OwnerGuard | Upser Note |
| GET | `/api/v1/owner/properties/:propertyId/calendar/price` | UserJwtGuard, OwnerGuard | Acceptable Price Range |
| POST | `/api/v1/owner/properties/:propertyId/calendar/price` | UserJwtGuard, OwnerGuard | Update Price |
| POST | `/api/v1/owner/properties/:propertyId/calendar/price/bulk` | UserJwtGuard, OwnerGuard | Update Price Of Many Days |
| POST | `/api/v1/owner/properties/:propertyId/calendar/reserves` | UserJwtGuard, OwnerGuard | Update Reserve Status |
| POST | `/api/v1/owner/properties/:propertyId/calendar/reserves/bulk` | UserJwtGuard, OwnerGuard | Update Reserve Status Of Many Days |

## property-option (8)

| متد | مسیر | محافظ | توضیح |
|---|---|---|---|
| GET | `/api/v1/admin/property-options` | AdminJwtGuard | Find All |
| POST | `/api/v1/admin/property-options` | AdminJwtGuard | Create |
| DELETE | `/api/v1/admin/property-options/:id` | AdminJwtGuard | Remove |
| GET | `/api/v1/admin/property-options/:id` | AdminJwtGuard | Find One |
| PUT | `/api/v1/admin/property-options/:id` | AdminJwtGuard | Update |
| PATCH | `/api/v1/admin/property-options/:id/update-partial` | AdminJwtGuard | Update Partial |
| GET | `/api/v1/admin/property-options/model-props` | AdminJwtGuard | Find model props |
| GET | `/api/v1/user/property-options` | عمومی |  |

## property-photo-upgrade-request (6)

| متد | مسیر | محافظ | توضیح |
|---|---|---|---|
| GET | `/api/v1/admin/property-photo-upgrade-requests` | AdminJwtGuard | Find All |
| GET | `/api/v1/admin/property-photo-upgrade-requests/:id` | AdminJwtGuard | Find One |
| PATCH | `/api/v1/admin/property-photo-upgrade-requests/:requestId/images/:itemId` | AdminJwtGuard | Update Photo Upgrade Request Image Status |
| GET | `/api/v1/admin/property-photo-upgrade-requests/model-props` | AdminJwtGuard | Find model props |
| GET | `/api/v1/owner/property-photo-upgrade-requests` | UserJwtGuard, OwnerGuard | Find All |
| GET | `/api/v1/owner/property-photo-upgrade-requests/:id` | UserJwtGuard, OwnerGuard | Find One |

## property-report (8)

| متد | مسیر | محافظ | توضیح |
|---|---|---|---|
| GET | `/api/v1/admin/property-reports` | AdminJwtGuard | Find All |
| POST | `/api/v1/admin/property-reports` | AdminJwtGuard | Create |
| DELETE | `/api/v1/admin/property-reports/:id` | AdminJwtGuard | Remove |
| GET | `/api/v1/admin/property-reports/:id` | AdminJwtGuard | Find One |
| PUT | `/api/v1/admin/property-reports/:id` | AdminJwtGuard | Update |
| PATCH | `/api/v1/admin/property-reports/:id/update-partial` | AdminJwtGuard | Update Partial |
| GET | `/api/v1/admin/property-reports/model-props` | AdminJwtGuard | Find model props |
| POST | `/api/v1/user/property-reports/:propertyId` | UserJwtGuard | Create |

## property-reserve (12)

| متد | مسیر | محافظ | توضیح |
|---|---|---|---|
| GET | `/api/v1/admin/property-reserves` | AdminJwtGuard | Find All |
| DELETE | `/api/v1/admin/property-reserves/:id` | AdminJwtGuard | Remove |
| GET | `/api/v1/admin/property-reserves/:id` | AdminJwtGuard | Find One |
| GET | `/api/v1/admin/property-reserves/model-props` | AdminJwtGuard | Find model props |
| GET | `/api/v1/owner/reserves` | UserJwtGuard, OwnerGuard | Find All |
| POST | `/api/v1/owner/reserves/:propertyReserveId/events/click-guest-mobile` | UserJwtGuard, OwnerGuard | Click On Guest Mobile |
| POST | `/api/v1/owner/reserves/:propertyReserveId/events/mark-seen` | UserJwtGuard, OwnerGuard | Mark request card as seen by the owner |
| GET | `/api/v1/owner/reserves/badge-count` | UserJwtGuard, OwnerGuard | Badge Count |
| GET | `/api/v1/reserves` | UserJwtGuard | Find All |
| POST | `/api/v1/reserves` | UserJwtGuard | Create |
| POST | `/api/v1/reserves` | UserJwtGuard |  |
| PATCH | `/api/v1/reserves/:propertyReserveId` | UserJwtGuard | Cancel |

## redirect-url (7)

| متد | مسیر | محافظ | توضیح |
|---|---|---|---|
| GET | `/api/v1/admin/redirect-urls` | AdminJwtGuard | Find All |
| POST | `/api/v1/admin/redirect-urls` | AdminJwtGuard | Create |
| DELETE | `/api/v1/admin/redirect-urls/:id` | AdminJwtGuard | Remove |
| GET | `/api/v1/admin/redirect-urls/:id` | AdminJwtGuard | Find One |
| PUT | `/api/v1/admin/redirect-urls/:id` | AdminJwtGuard | Update |
| GET | `/api/v1/admin/redirect-urls/model-props` | AdminJwtGuard | Find model props |
| GET | `/api/v1/user/redirect-urls/:sourceHash` | UserJwtGuard | Find one by source hash |

## setting (9)

| متد | مسیر | محافظ | توضیح |
|---|---|---|---|
| GET | `/api/v1/admin/settings` | AdminJwtGuard |  |
| PATCH | `/api/v1/admin/settings/:id` | AdminJwtGuard |  |
| POST | `/api/v1/admin/settings/llms` | AdminJwtGuard | Update llms.txt |
| POST | `/api/v1/admin/settings/robot` | AdminJwtGuard | Update robot.txt |
| POST | `/api/v1/admin/settings/sitemap` | AdminJwtGuard | Update  |
| GET | `/api/v1/settings` | عمومی | Find All Client Settings |
| GET | `/api/v1/settings/llms` | عمومی | Find llms.txt |
| GET | `/api/v1/settings/robots` | عمومی | Find robots.txt |
| GET | `/api/v1/settings/sitemap` | عمومی | Find sitemap.xml |

## submitted-form (8)

| متد | مسیر | محافظ | توضیح |
|---|---|---|---|
| GET | `/api/v1/admin/submitted-forms` | AdminJwtGuard | Find All |
| POST | `/api/v1/admin/submitted-forms` | AdminJwtGuard | Create |
| DELETE | `/api/v1/admin/submitted-forms/:id` | AdminJwtGuard | Remove |
| GET | `/api/v1/admin/submitted-forms/:id` | AdminJwtGuard | Find One |
| PUT | `/api/v1/admin/submitted-forms/:id` | AdminJwtGuard | Update |
| PATCH | `/api/v1/admin/submitted-forms/:id/update-partial` | AdminJwtGuard | Update Partial |
| GET | `/api/v1/admin/submitted-forms/model-props` | AdminJwtGuard | Find model props |
| POST | `/api/v1/user/submitted-forms` | عمومی | Create |

## subscription (6)

| متد | مسیر | محافظ | توضیح |
|---|---|---|---|
| GET | `/api/v1/admin/subscriptions` | AdminJwtGuard | Find All |
| POST | `/api/v1/admin/subscriptions` | AdminJwtGuard | Create |
| GET | `/api/v1/admin/subscriptions/:id` | AdminJwtGuard | Find One |
| GET | `/api/v1/admin/subscriptions/excel` | AdminJwtGuard | Get Excel |
| GET | `/api/v1/admin/subscriptions/model-props` | AdminJwtGuard | Find model props |
| GET | `/api/v1/user/subscriptions` | UserJwtGuard | Find All |

## subscription-plan (10)

| متد | مسیر | محافظ | توضیح |
|---|---|---|---|
| GET | `/api/v1/admin/subscription-plans` | AdminJwtGuard | Find All |
| POST | `/api/v1/admin/subscription-plans` | AdminJwtGuard | Create |
| DELETE | `/api/v1/admin/subscription-plans/:id` | AdminJwtGuard | Delete |
| GET | `/api/v1/admin/subscription-plans/:id` | AdminJwtGuard | Find One |
| PUT | `/api/v1/admin/subscription-plans/:id` | AdminJwtGuard | Update |
| PATCH | `/api/v1/admin/subscription-plans/:id/update-partial` | AdminJwtGuard | Update Partial |
| GET | `/api/v1/admin/subscription-plans/model-props` | AdminJwtGuard | Find model props |
| POST | `/api/v1/admin/subscription-plans/subscriptions` | AdminJwtGuard |  |
| GET | `/api/v1/admin/subscription-plans/subscriptions/:id` | AdminJwtGuard |  |
| GET | `/api/v1/user/subscription-plans` | UserJwtGuard | Find All |

## test-access (4)

| متد | مسیر | محافظ | توضیح |
|---|---|---|---|
| GET | `/api/v1/user/test-access/me` | UserJwtGuard |  |
| GET | `/api/v1/user/test-access/members` | UserJwtGuard |  |
| POST | `/api/v1/user/test-access/members` | UserJwtGuard |  |
| PATCH | `/api/v1/user/test-access/members/:id` | UserJwtGuard |  |

## ticket (10)

| متد | مسیر | محافظ | توضیح |
|---|---|---|---|
| GET | `/api/v1/admin/tickets` | AdminJwtGuard | Find All |
| DELETE | `/api/v1/admin/tickets/:id` | AdminJwtGuard | Delete |
| GET | `/api/v1/admin/tickets/:id` | AdminJwtGuard | Find one |
| PATCH | `/api/v1/admin/tickets/:id` | AdminJwtGuard | Reply |
| PUT | `/api/v1/admin/tickets/:id` | AdminJwtGuard | Close ticket |
| GET | `/api/v1/admin/tickets/model-props` | AdminJwtGuard | Find model props |
| GET | `/api/v1/user/tickets` | UserJwtGuard | Find all |
| POST | `/api/v1/user/tickets` | UserJwtGuard | Create |
| GET | `/api/v1/user/tickets/:id` | UserJwtGuard | Find one |
| POST | `/api/v1/user/tickets/:id` | UserJwtGuard | Reply |

## user (10)

| متد | مسیر | محافظ | توضیح |
|---|---|---|---|
| GET | `/api/v1/admin/users` | AdminJwtGuard | Find All |
| POST | `/api/v1/admin/users` | AdminJwtGuard | Create |
| DELETE | `/api/v1/admin/users/:id` | AdminJwtGuard | Update Partial |
| GET | `/api/v1/admin/users/:id` | AdminJwtGuard | Find One |
| PUT | `/api/v1/admin/users/:id` | AdminJwtGuard | Update |
| GET | `/api/v1/admin/users/:id/sso` | AdminJwtGuard | User SSO |
| PATCH | `/api/v1/admin/users/:id/update-partial` | AdminJwtGuard | Update Partial |
| GET | `/api/v1/admin/users/excel` | AdminJwtGuard | Create |
| GET | `/api/v1/admin/users/model-props` | AdminJwtGuard | Find model props |
| GET | `/api/v1/admin/users/search` | AdminJwtGuard | Search user |
