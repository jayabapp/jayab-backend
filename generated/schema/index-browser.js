
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.19.1
 * Query Engine version: 69d742ee20b815d88e17e54db4a2a7a3b30324e3
 */
Prisma.prismaVersion = {
  client: "5.19.1",
  engine: "69d742ee20b815d88e17e54db4a2a7a3b30324e3"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}

/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.BaseScalarFieldEnum = {
  id: 'id'
};

exports.Prisma.OtpScalarFieldEnum = {
  id: 'id',
  mobile_number: 'mobile_number',
  attempts: 'attempts',
  code: 'code',
  sms_send_at: 'sms_send_at',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.AdminScalarFieldEnum = {
  id: 'id',
  username: 'username',
  password: 'password',
  full_name: 'full_name',
  mobile_number: 'mobile_number',
  role_id: 'role_id',
  is_active: 'is_active',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.AccessControlModuleScalarFieldEnum = {
  id: 'id',
  key: 'key',
  name: 'name',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.AccessControlRoleScalarFieldEnum = {
  id: 'id',
  name: 'name',
  key: 'key',
  tree: 'tree',
  created_at: 'created_at',
  updated_at: 'updated_at',
  deleted_at: 'deleted_at'
};

exports.Prisma.AccessControlListScalarFieldEnum = {
  id: 'id',
  module_id: 'module_id',
  role_id: 'role_id',
  c: 'c',
  r: 'r',
  u: 'u',
  d: 'd',
  v: 'v',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.AdminRoleNotificationPermissionScalarFieldEnum = {
  id: 'id',
  role_id: 'role_id',
  permissions: 'permissions',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.AdminActivityScalarFieldEnum = {
  id: 'id',
  os: 'os',
  browser: 'browser',
  browser_ver: 'browser_ver',
  ip_v4: 'ip_v4',
  admin_id: 'admin_id',
  module: 'module',
  path: 'path',
  method: 'method',
  className: 'className',
  classMethod: 'classMethod',
  param: 'param',
  query: 'query',
  body: 'body',
  result_id: 'result_id',
  status_code: 'status_code',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.AttachmentScalarFieldEnum = {
  id: 'id',
  user_id: 'user_id',
  admin_id: 'admin_id',
  user_role: 'user_role',
  name: 'name',
  meta: 'meta',
  thumbnail: 'thumbnail',
  type: 'type',
  path: 'path',
  bucket: 'bucket',
  region: 'region',
  end_point: 'end_point',
  medium: 'medium',
  alt: 'alt',
  created_at: 'created_at',
  updated_at: 'updated_at',
  deleted_at: 'deleted_at'
};

exports.Prisma.ContentCategoryScalarFieldEnum = {
  id: 'id',
  title: 'title',
  slug: 'slug',
  key: 'key',
  image_id: 'image_id',
  dynamic_fields: 'dynamic_fields',
  parent_id: 'parent_id',
  description: 'description',
  html: 'html',
  show_in_sitemap: 'show_in_sitemap',
  seo: 'seo',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.ContentScalarFieldEnum = {
  id: 'id',
  title: 'title',
  slug: 'slug',
  key: 'key',
  small_text: 'small_text',
  full_text: 'full_text',
  feature_image_id: 'feature_image_id',
  is_active: 'is_active',
  category_id: 'category_id',
  order: 'order',
  html: 'html',
  view_count: 'view_count',
  link: 'link',
  video_id: 'video_id',
  show_in_sitemap: 'show_in_sitemap',
  fields: 'fields',
  seo: 'seo',
  form_id: 'form_id',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.ContentAttachmentScalarFieldEnum = {
  id: 'id',
  content_id: 'content_id',
  attachment_id: 'attachment_id',
  created_at: 'created_at',
  updated_at: 'updated_at',
  deleted_at: 'deleted_at'
};

exports.Prisma.ContentQuestionScalarFieldEnum = {
  id: 'id',
  content_id: 'content_id',
  content_category_id: 'content_category_id',
  question: 'question',
  answer: 'answer',
  image_id: 'image_id',
  admin_id: 'admin_id',
  rate: 'rate',
  author_name: 'author_name',
  mobile_number: 'mobile_number',
  is_publish: 'is_publish',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.CityScalarFieldEnum = {
  id: 'id',
  title: 'title',
  parent_id: 'parent_id',
  sort_order: 'sort_order',
  slug: 'slug',
  slug_fa: 'slug_fa',
  tel_prefix: 'tel_prefix',
  image_id: 'image_id',
  created_at: 'created_at',
  updated_at: 'updated_at',
  deleted_at: 'deleted_at',
  advisorId: 'advisorId'
};

exports.Prisma.SettingScalarFieldEnum = {
  id: 'id',
  title: 'title',
  key: 'key',
  value: 'value',
  max: 'max',
  min: 'min',
  data_type: 'data_type',
  sort_order: 'sort_order',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.BannerScalarFieldEnum = {
  id: 'id',
  title: 'title',
  is_active: 'is_active',
  description: 'description',
  link: 'link',
  category_id: 'category_id',
  property_id: 'property_id',
  brand_id: 'brand_id',
  position: 'position',
  sort_order: 'sort_order',
  image_id: 'image_id',
  image_sm_id: 'image_sm_id',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.CategoryScalarFieldEnum = {
  id: 'id',
  parent_id: 'parent_id',
  title: 'title',
  key: 'key',
  image_id: 'image_id',
  sort_order: 'sort_order',
  is_active: 'is_active',
  path: 'path',
  hex_color: 'hex_color',
  is_feature_category: 'is_feature_category',
  feature_title: 'feature_title',
  created_at: 'created_at',
  updated_at: 'updated_at',
  deleted_at: 'deleted_at'
};

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  mobile_number: 'mobile_number',
  full_name: 'full_name',
  profile_image_id: 'profile_image_id',
  owner_id: 'owner_id',
  advisor_id: 'advisor_id',
  is_banned: 'is_banned',
  referral_code: 'referral_code',
  referrer_code: 'referrer_code',
  fcm_token: 'fcm_token',
  jwt_level: 'jwt_level',
  notification_read_at: 'notification_read_at',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.OwnerScalarFieldEnum = {
  id: 'id',
  national_code: 'national_code',
  selfie_image_id: 'selfie_image_id',
  status: 'status',
  admin_descriptions: 'admin_descriptions',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.AdvisorScalarFieldEnum = {
  id: 'id',
  national_code: 'national_code',
  tel: 'tel',
  area_code: 'area_code',
  address: 'address',
  is_special: 'is_special',
  status: 'status',
  admin_descriptions: 'admin_descriptions',
  sort_order: 'sort_order',
  subscription_expired_at: 'subscription_expired_at',
  users_satisfaction: 'users_satisfaction',
  owners_satisfaction: 'owners_satisfaction',
  advisor_behavior: 'advisor_behavior',
  advisor_responsibility: 'advisor_responsibility',
  response_speed_and_followup: 'response_speed_and_followup',
  national_card_image_id: 'national_card_image_id',
  document_image_id: 'document_image_id',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.RateScalarFieldEnum = {
  id: 'id',
  user_id: 'user_id',
  advisor_id: 'advisor_id',
  advisor_behavior: 'advisor_behavior',
  advisor_responsibility: 'advisor_responsibility',
  response_speed_and_followup: 'response_speed_and_followup',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.PropertyScalarFieldEnum = {
  id: 'id',
  code: 'code',
  owner_id: 'owner_id',
  title: 'title',
  slug: 'slug',
  slug_hash: 'slug_hash',
  land_area: 'land_area',
  building_area: 'building_area',
  floors: 'floors',
  unit_per_floor: 'unit_per_floor',
  floor: 'floor',
  construction_year: 'construction_year',
  region_id: 'region_id',
  province_id: 'province_id',
  city_id: 'city_id',
  address: 'address',
  lat: 'lat',
  lng: 'lng',
  feature_image_id: 'feature_image_id',
  video_id: 'video_id',
  is_chat_enabled: 'is_chat_enabled',
  is_location_visible: 'is_location_visible',
  has_pool: 'has_pool',
  std_capacity: 'std_capacity',
  max_capacity: 'max_capacity',
  canceling_type: 'canceling_type',
  advisor_commission: 'advisor_commission',
  check_in_hour: 'check_in_hour',
  check_out_hour: 'check_out_hour',
  subscription_expired_at: 'subscription_expired_at',
  sort_order: 'sort_order',
  contact_type: 'contact_type',
  status: 'status',
  admin_descriptions: 'admin_descriptions',
  is_authorized: 'is_authorized',
  has_blue_tick: 'has_blue_tick',
  options_array: 'options_array',
  favorite_count: 'favorite_count',
  created_at: 'created_at',
  updated_at: 'updated_at',
  deleted_at: 'deleted_at'
};

exports.Prisma.OptionsOnPropertyScalarFieldEnum = {
  property_id: 'property_id',
  option_id: 'option_id',
  assigned_at: 'assigned_at'
};

exports.Prisma.PropertyDescriptionScalarFieldEnum = {
  id: 'id',
  property_id: 'property_id',
  property_dscr: 'property_dscr',
  pattern_dscr: 'pattern_dscr',
  distance_dscr: 'distance_dscr',
  facility_dscr: 'facility_dscr',
  guest_dscr: 'guest_dscr',
  pet_dscr: 'pet_dscr',
  party_dscr: 'party_dscr',
  doc_dscr: 'doc_dscr',
  other_dscr: 'other_dscr',
  ad_dscr: 'ad_dscr',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.PropertyBedroomScalarFieldEnum = {
  id: 'id',
  property_id: 'property_id',
  bedrooms: 'bedrooms',
  additional_bed: 'additional_bed',
  master_room: 'master_room',
  sofa_bed: 'sofa_bed',
  wc: 'wc',
  wc_ir: 'wc_ir',
  bathroom_master: 'bathroom_master',
  bathroom_general: 'bathroom_general',
  bathroom_in_wc: 'bathroom_in_wc',
  bathroom_tub: 'bathroom_tub',
  total_bedrooms: 'total_bedrooms',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.PropertyDailyPriceScalarFieldEnum = {
  id: 'id',
  property_id: 'property_id',
  normal: 'normal',
  wednesday: 'wednesday',
  thursday: 'thursday',
  friday: 'friday',
  peak: 'peak',
  cleaning: 'cleaning',
  additional_person: 'additional_person',
  today_offer: 'today_offer',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.PropertyOwnerAssistantScalarFieldEnum = {
  id: 'id',
  property_id: 'property_id',
  is_owner: 'is_owner',
  assistant_mobile_number: 'assistant_mobile_number',
  assistant_full_name: 'assistant_full_name',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.PropertyStatisticsScalarFieldEnum = {
  id: 'id',
  property_id: 'property_id',
  view_count: 'view_count',
  date: 'date',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.PropertyOptionScalarFieldEnum = {
  id: 'id',
  title: 'title',
  key: 'key',
  description: 'description',
  group: 'group',
  sort: 'sort',
  image_id: 'image_id',
  created_at: 'created_at',
  updated_at: 'updated_at',
  deleted_at: 'deleted_at'
};

exports.Prisma.PropertyAuthorizeScalarFieldEnum = {
  id: 'id',
  property_id: 'property_id',
  nc_image_id: 'nc_image_id',
  status: 'status',
  changelog: 'changelog',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.PropertyCalendarScalarFieldEnum = {
  id: 'id',
  property_id: 'property_id',
  day: 'day',
  month: 'month',
  year: 'year',
  date: 'date',
  note: 'note',
  is_reserved: 'is_reserved',
  price: 'price',
  discounted_price: 'discounted_price',
  discount_percentage: 'discount_percentage',
  effective_price: 'effective_price',
  advisor_commission: 'advisor_commission',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.PropertyBadgeScalarFieldEnum = {
  id: 'id',
  property_id: 'property_id',
  status: 'status',
  changelog: 'changelog',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.SubscriptionPlanScalarFieldEnum = {
  id: 'id',
  group: 'group',
  title: 'title',
  description: 'description',
  duration: 'duration',
  price: 'price',
  price_with_discount: 'price_with_discount',
  is_active: 'is_active',
  sort: 'sort',
  is_promote: 'is_promote',
  is_special: 'is_special',
  created_at: 'created_at',
  updated_at: 'updated_at',
  deleted_at: 'deleted_at'
};

exports.Prisma.PaymentScalarFieldEnum = {
  id: 'id',
  property_id: 'property_id',
  user_id: 'user_id',
  advisor_id: 'advisor_id',
  gateway_key: 'gateway_key',
  amount: 'amount',
  pay_by_wallet: 'pay_by_wallet',
  pay_by_gateway: 'pay_by_gateway',
  debt: 'debt',
  gate: 'gate',
  authority: 'authority',
  ref_id: 'ref_id',
  type: 'type',
  status: 'status',
  description: 'description',
  redirect_url: 'redirect_url',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.PaymentGatewayScalarFieldEnum = {
  id: 'id',
  title: 'title',
  logo: 'logo',
  key: 'key',
  is_active: 'is_active',
  params: 'params',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.TurnoverScalarFieldEnum = {
  id: 'id',
  user_id: 'user_id',
  turnoverable_id: 'turnoverable_id',
  turnoverable_type: 'turnoverable_type',
  amount: 'amount',
  title: 'title',
  description: 'description',
  type: 'type',
  balance: 'balance',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.FavoriteScalarFieldEnum = {
  id: 'id',
  property_id: 'property_id',
  user_id: 'user_id',
  created_at: 'created_at'
};

exports.Prisma.BookmarkScalarFieldEnum = {
  id: 'id',
  property_id: 'property_id',
  user_id: 'user_id',
  created_at: 'created_at'
};

exports.Prisma.NotificationScalarFieldEnum = {
  id: 'id',
  user_id: 'user_id',
  is_sent_by_admin: 'is_sent_by_admin',
  role: 'role',
  title: 'title',
  body: 'body',
  topic: 'topic',
  data: 'data',
  seen_at: 'seen_at',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.TicketScalarFieldEnum = {
  id: 'id',
  user_id: 'user_id',
  title: 'title',
  message: 'message',
  status: 'status',
  created_at: 'created_at',
  updated_at: 'updated_at',
  deleted_at: 'deleted_at'
};

exports.Prisma.TicketRepliesScalarFieldEnum = {
  id: 'id',
  ticket_id: 'ticket_id',
  message: 'message',
  by_admin: 'by_admin',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.FormBuilderScalarFieldEnum = {
  id: 'id',
  title: 'title',
  type: 'type',
  content_id: 'content_id',
  options: 'options',
  key: 'key',
  sort_order: 'sort_order',
  is_mandatory: 'is_mandatory',
  description: 'description',
  created_at: 'created_at',
  updated_at: 'updated_at',
  deleted_at: 'deleted_at'
};

exports.Prisma.SubmittedFormScalarFieldEnum = {
  id: 'id',
  content_id: 'content_id',
  mobile_number: 'mobile_number',
  full_name: 'full_name',
  ip: 'ip',
  status: 'status',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.SubmittedFormItemsScalarFieldEnum = {
  id: 'id',
  submitted_form_id: 'submitted_form_id',
  title: 'title',
  value: 'value',
  type: 'type',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.MessengerChatroomScalarFieldEnum = {
  id: 'id',
  uuid: 'uuid',
  property_id: 'property_id',
  last_message_id: 'last_message_id',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.MessengerParticipantScalarFieldEnum = {
  id: 'id',
  chatroom_id: 'chatroom_id',
  user_id: 'user_id',
  role: 'role',
  message_read_at: 'message_read_at',
  created_at: 'created_at',
  updated_at: 'updated_at',
  deleted_at: 'deleted_at'
};

exports.Prisma.MessengerMessagesScalarFieldEnum = {
  id: 'id',
  chatroom_id: 'chatroom_id',
  participant_id: 'participant_id',
  text: 'text',
  media_id: 'media_id',
  third_party: 'third_party',
  created_at: 'created_at',
  updated_at: 'updated_at',
  deleted_at: 'deleted_at'
};

exports.Prisma.MessengerBlackListScalarFieldEnum = {
  id: 'id',
  blocker_id: 'blocker_id',
  blocked_id: 'blocked_id',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.SubscriptionScalarFieldEnum = {
  id: 'id',
  property_id: 'property_id',
  advisor_id: 'advisor_id',
  is_promote: 'is_promote',
  is_special_advisor: 'is_special_advisor',
  title: 'title',
  duration: 'duration',
  price: 'price',
  payment_id: 'payment_id',
  status: 'status',
  description: 'description',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.SubscriptionReminderScalarFieldEnum = {
  id: 'id',
  property_id: 'property_id',
  advisor_id: 'advisor_id',
  type: 'type',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.PeakDayScalarFieldEnum = {
  id: 'id',
  day: 'day',
  month: 'month',
  year: 'year',
  date: 'date',
  timestamp: 'timestamp',
  is_nowruz: 'is_nowruz',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.LandingPageScalarFieldEnum = {
  id: 'id',
  title: 'title',
  main_content_id: 'main_content_id',
  related_contents: 'related_contents',
  related_landings: 'related_landings',
  url: 'url',
  is_active: 'is_active',
  show_in_home: 'show_in_home',
  options: 'options',
  province_id: 'province_id',
  cities: 'cities',
  has_pool: 'has_pool',
  property_type: 'property_type',
  min_discount_percentage: 'min_discount_percentage',
  is_premium: 'is_premium',
  min_price: 'min_price',
  max_price: 'max_price',
  min_bedroom: 'min_bedroom',
  max_bedroom: 'max_bedroom',
  image_id: 'image_id',
  sort_order: 'sort_order',
  position: 'position',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.UnreadMessageCountScalarFieldEnum = {
  user_id: 'user_id',
  unread_count: 'unread_count'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull
};

exports.Prisma.JsonNullValueInput = {
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.OtpOrderByRelevanceFieldEnum = {
  mobile_number: 'mobile_number',
  code: 'code'
};

exports.Prisma.AdminOrderByRelevanceFieldEnum = {
  username: 'username',
  password: 'password',
  full_name: 'full_name',
  mobile_number: 'mobile_number'
};

exports.Prisma.AccessControlModuleOrderByRelevanceFieldEnum = {
  key: 'key',
  name: 'name'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};

exports.Prisma.AccessControlRoleOrderByRelevanceFieldEnum = {
  name: 'name',
  key: 'key',
  tree: 'tree'
};

exports.Prisma.AdminRoleNotificationPermissionOrderByRelevanceFieldEnum = {
  permissions: 'permissions'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};

exports.Prisma.AdminActivityOrderByRelevanceFieldEnum = {
  os: 'os',
  browser: 'browser',
  browser_ver: 'browser_ver',
  ip_v4: 'ip_v4',
  module: 'module',
  path: 'path',
  method: 'method',
  className: 'className',
  classMethod: 'classMethod'
};

exports.Prisma.AttachmentOrderByRelevanceFieldEnum = {
  user_role: 'user_role',
  name: 'name',
  meta: 'meta',
  thumbnail: 'thumbnail',
  path: 'path',
  bucket: 'bucket',
  region: 'region',
  end_point: 'end_point',
  medium: 'medium',
  alt: 'alt'
};

exports.Prisma.ContentCategoryOrderByRelevanceFieldEnum = {
  title: 'title',
  slug: 'slug',
  key: 'key',
  description: 'description',
  html: 'html'
};

exports.Prisma.ContentOrderByRelevanceFieldEnum = {
  title: 'title',
  slug: 'slug',
  key: 'key',
  small_text: 'small_text',
  full_text: 'full_text',
  html: 'html',
  link: 'link'
};

exports.Prisma.ContentQuestionOrderByRelevanceFieldEnum = {
  question: 'question',
  answer: 'answer',
  author_name: 'author_name',
  mobile_number: 'mobile_number'
};

exports.Prisma.CityOrderByRelevanceFieldEnum = {
  title: 'title',
  slug: 'slug',
  slug_fa: 'slug_fa',
  tel_prefix: 'tel_prefix'
};

exports.Prisma.SettingOrderByRelevanceFieldEnum = {
  title: 'title',
  key: 'key',
  value: 'value',
  data_type: 'data_type'
};

exports.Prisma.BannerOrderByRelevanceFieldEnum = {
  title: 'title',
  description: 'description',
  link: 'link',
  position: 'position'
};

exports.Prisma.CategoryOrderByRelevanceFieldEnum = {
  title: 'title',
  key: 'key',
  path: 'path',
  hex_color: 'hex_color',
  feature_title: 'feature_title'
};

exports.Prisma.UserOrderByRelevanceFieldEnum = {
  mobile_number: 'mobile_number',
  full_name: 'full_name',
  referral_code: 'referral_code',
  referrer_code: 'referrer_code',
  fcm_token: 'fcm_token'
};

exports.Prisma.OwnerOrderByRelevanceFieldEnum = {
  national_code: 'national_code'
};

exports.Prisma.AdvisorOrderByRelevanceFieldEnum = {
  national_code: 'national_code',
  tel: 'tel',
  area_code: 'area_code',
  address: 'address'
};

exports.Prisma.PropertyOrderByRelevanceFieldEnum = {
  code: 'code',
  title: 'title',
  slug: 'slug',
  slug_hash: 'slug_hash',
  address: 'address',
  canceling_type: 'canceling_type',
  check_in_hour: 'check_in_hour',
  check_out_hour: 'check_out_hour'
};

exports.Prisma.PropertyDescriptionOrderByRelevanceFieldEnum = {
  property_dscr: 'property_dscr',
  pattern_dscr: 'pattern_dscr',
  distance_dscr: 'distance_dscr',
  facility_dscr: 'facility_dscr',
  guest_dscr: 'guest_dscr',
  pet_dscr: 'pet_dscr',
  party_dscr: 'party_dscr',
  doc_dscr: 'doc_dscr',
  other_dscr: 'other_dscr',
  ad_dscr: 'ad_dscr'
};

exports.Prisma.PropertyOwnerAssistantOrderByRelevanceFieldEnum = {
  assistant_mobile_number: 'assistant_mobile_number',
  assistant_full_name: 'assistant_full_name'
};

exports.Prisma.PropertyOptionOrderByRelevanceFieldEnum = {
  title: 'title',
  key: 'key',
  description: 'description',
  group: 'group'
};

exports.Prisma.PropertyCalendarOrderByRelevanceFieldEnum = {
  note: 'note'
};

exports.Prisma.SubscriptionPlanOrderByRelevanceFieldEnum = {
  group: 'group',
  title: 'title',
  description: 'description'
};

exports.Prisma.PaymentOrderByRelevanceFieldEnum = {
  gateway_key: 'gateway_key',
  gate: 'gate',
  authority: 'authority',
  ref_id: 'ref_id',
  type: 'type',
  description: 'description',
  redirect_url: 'redirect_url'
};

exports.Prisma.PaymentGatewayOrderByRelevanceFieldEnum = {
  title: 'title',
  logo: 'logo',
  key: 'key'
};

exports.Prisma.TurnoverOrderByRelevanceFieldEnum = {
  turnoverable_type: 'turnoverable_type',
  title: 'title',
  description: 'description',
  type: 'type'
};

exports.Prisma.NotificationOrderByRelevanceFieldEnum = {
  role: 'role',
  title: 'title',
  body: 'body',
  topic: 'topic'
};

exports.Prisma.TicketOrderByRelevanceFieldEnum = {
  title: 'title',
  message: 'message'
};

exports.Prisma.TicketRepliesOrderByRelevanceFieldEnum = {
  message: 'message'
};

exports.Prisma.FormBuilderOrderByRelevanceFieldEnum = {
  title: 'title',
  type: 'type',
  key: 'key',
  description: 'description'
};

exports.Prisma.SubmittedFormOrderByRelevanceFieldEnum = {
  mobile_number: 'mobile_number',
  full_name: 'full_name',
  ip: 'ip'
};

exports.Prisma.SubmittedFormItemsOrderByRelevanceFieldEnum = {
  title: 'title',
  value: 'value',
  type: 'type'
};

exports.Prisma.MessengerChatroomOrderByRelevanceFieldEnum = {
  uuid: 'uuid'
};

exports.Prisma.MessengerParticipantOrderByRelevanceFieldEnum = {
  role: 'role'
};

exports.Prisma.MessengerMessagesOrderByRelevanceFieldEnum = {
  text: 'text',
  third_party: 'third_party'
};

exports.Prisma.SubscriptionOrderByRelevanceFieldEnum = {
  title: 'title',
  description: 'description'
};

exports.Prisma.SubscriptionReminderOrderByRelevanceFieldEnum = {
  type: 'type'
};

exports.Prisma.LandingPageOrderByRelevanceFieldEnum = {
  title: 'title',
  url: 'url',
  position: 'position'
};


exports.Prisma.ModelName = {
  Base: 'Base',
  Otp: 'Otp',
  Admin: 'Admin',
  AccessControlModule: 'AccessControlModule',
  AccessControlRole: 'AccessControlRole',
  AccessControlList: 'AccessControlList',
  AdminRoleNotificationPermission: 'AdminRoleNotificationPermission',
  AdminActivity: 'AdminActivity',
  Attachment: 'Attachment',
  ContentCategory: 'ContentCategory',
  Content: 'Content',
  ContentAttachment: 'ContentAttachment',
  ContentQuestion: 'ContentQuestion',
  City: 'City',
  Setting: 'Setting',
  Banner: 'Banner',
  Category: 'Category',
  User: 'User',
  Owner: 'Owner',
  Advisor: 'Advisor',
  Rate: 'Rate',
  Property: 'Property',
  OptionsOnProperty: 'OptionsOnProperty',
  PropertyDescription: 'PropertyDescription',
  PropertyBedroom: 'PropertyBedroom',
  PropertyDailyPrice: 'PropertyDailyPrice',
  PropertyOwnerAssistant: 'PropertyOwnerAssistant',
  PropertyStatistics: 'PropertyStatistics',
  PropertyOption: 'PropertyOption',
  PropertyAuthorize: 'PropertyAuthorize',
  PropertyCalendar: 'PropertyCalendar',
  PropertyBadge: 'PropertyBadge',
  SubscriptionPlan: 'SubscriptionPlan',
  Payment: 'Payment',
  PaymentGateway: 'PaymentGateway',
  Turnover: 'Turnover',
  Favorite: 'Favorite',
  Bookmark: 'Bookmark',
  Notification: 'Notification',
  Ticket: 'Ticket',
  TicketReplies: 'TicketReplies',
  FormBuilder: 'FormBuilder',
  SubmittedForm: 'SubmittedForm',
  SubmittedFormItems: 'SubmittedFormItems',
  MessengerChatroom: 'MessengerChatroom',
  MessengerParticipant: 'MessengerParticipant',
  MessengerMessages: 'MessengerMessages',
  MessengerBlackList: 'MessengerBlackList',
  Subscription: 'Subscription',
  SubscriptionReminder: 'SubscriptionReminder',
  PeakDay: 'PeakDay',
  LandingPage: 'LandingPage',
  UnreadMessageCount: 'UnreadMessageCount'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
