
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

exports.Prisma.OtpScalarFieldEnum = {
  id: 'id',
  mobile_number: 'mobile_number',
  code: 'code',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  mobile_number: 'mobile_number',
  referral_code: 'referral_code',
  customer_id: 'customer_id',
  owner_id: 'owner_id',
  advisor_id: 'advisor_id',
  notif_last_seen: 'notif_last_seen',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.CustomerScalarFieldEnum = {
  id: 'id',
  full_name: 'full_name',
  fcm_token: 'fcm_token',
  ref: 'ref',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.OwnerScalarFieldEnum = {
  id: 'id',
  full_name: 'full_name',
  fcm_token: 'fcm_token',
  ref: 'ref',
  profile_image_id: 'profile_image_id',
  rate: 'rate',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.AdvisorScalarFieldEnum = {
  id: 'id',
  full_name: 'full_name',
  fcm_token: 'fcm_token',
  ref: 'ref',
  national_id: 'national_id',
  tel: 'tel',
  area_code: 'area_code',
  profile_image_id: 'profile_image_id',
  rate: 'rate',
  status: 'status',
  statistics: 'statistics',
  nc_image_id: 'nc_image_id',
  is_special: 'is_special',
  special_advisor_info: 'special_advisor_info',
  sort_order: 'sort_order',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.AdvisorNoteScalarFieldEnum = {
  id: 'id',
  day: 'day',
  month: 'month',
  year: 'year',
  note: 'note',
  timestamp: 'timestamp',
  advisor_id: 'advisor_id',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.AuthorizedUserScalarFieldEnum = {
  id: 'id',
  role: 'role',
  user_id: 'user_id',
  mobile_number: 'mobile_number',
  bank_cart_number: 'bank_cart_number',
  status: 'status',
  dwelling_address: 'dwelling_address',
  dwelling_doc_id: 'dwelling_doc_id',
  nc_image_id: 'nc_image_id',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.AttachmentScalarFieldEnum = {
  id: 'id',
  user_id: 'user_id',
  name: 'name',
  meta: 'meta',
  thumbnail: 'thumbnail',
  type: 'type',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.SubscriptionScalarFieldEnum = {
  id: 'id',
  user_id: 'user_id',
  role: 'role',
  start_at: 'start_at',
  expire_at: 'expire_at',
  subscription_plan: 'subscription_plan',
  payment_id: 'payment_id',
  renewal_count: 'renewal_count',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.RentRequestScalarFieldEnum = {
  id: 'id',
  guests: 'guests',
  bedrooms: 'bedrooms',
  owner_settlement_amount: 'owner_settlement_amount',
  rent_type: 'rent_type',
  creator_customer_id: 'creator_customer_id',
  creator_advisor_id: 'creator_advisor_id',
  province_id: 'province_id',
  has_pool: 'has_pool',
  status: 'status',
  start_day: 'start_day',
  end_day: 'end_day',
  start_hour: 'start_hour',
  end_hour: 'end_hour',
  max_deposit: 'max_deposit',
  max_rent: 'max_rent',
  wc: 'wc',
  wc_ir: 'wc_ir',
  bathroom_master: 'bathroom_master',
  bathroom_general: 'bathroom_general',
  bathroom_in_wc: 'bathroom_in_wc',
  bathroom_tub: 'bathroom_tub',
  description: 'description',
  direct_property_id: 'direct_property_id',
  forked_from_id: 'forked_from_id',
  created_at: 'created_at',
  updated_at: 'updated_at',
  deleted_at: 'deleted_at'
};

exports.Prisma.OptionsOnRentRequestScalarFieldEnum = {
  rent_request_id: 'rent_request_id',
  option_id: 'option_id',
  assigned_at: 'assigned_at'
};

exports.Prisma.OwnerRentRequestScalarFieldEnum = {
  id: 'id',
  rent_request_id: 'rent_request_id',
  property_id: 'property_id',
  status: 'status',
  calculated_price: 'calculated_price',
  seen: 'seen',
  owner_price: 'owner_price',
  advisor_commission_amount: 'advisor_commission_amount',
  final_price: 'final_price',
  created_at: 'created_at',
  updated_at: 'updated_at',
  deleted_at: 'deleted_at'
};

exports.Prisma.OwnerRentRequestAgreementScalarFieldEnum = {
  id: 'id',
  owner_rent_request_id: 'owner_rent_request_id',
  total_amount: 'total_amount',
  deposit: 'deposit',
  settlement: 'settlement',
  guest_full_name: 'guest_full_name',
  check_in: 'check_in',
  check_out: 'check_out',
  advisor_description: 'advisor_description',
  status: 'status',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.PropertyScalarFieldEnum = {
  id: 'id',
  code: 'code',
  owner_id: 'owner_id',
  title: 'title',
  land_area: 'land_area',
  building_area: 'building_area',
  floors: 'floors',
  unit_per_floor: 'unit_per_floor',
  floor: 'floor',
  construction_year: 'construction_year',
  province_id: 'province_id',
  city_id: 'city_id',
  region_id: 'region_id',
  address: 'address',
  lat: 'lat',
  lng: 'lng',
  feature_image_id: 'feature_image_id',
  video_id: 'video_id',
  has_pool: 'has_pool',
  std_capacity: 'std_capacity',
  max_capacity: 'max_capacity',
  canceling_type: 'canceling_type',
  status_step: 'status_step',
  subscription_id: 'subscription_id',
  statistics: 'statistics',
  advisor_commission: 'advisor_commission',
  is_auto_approve: 'is_auto_approve',
  calendar_updated_at: 'calendar_updated_at',
  rate: 'rate',
  created_at: 'created_at',
  updated_at: 'updated_at',
  attachmentId: 'attachmentId'
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

exports.Prisma.OptionsOnPropertyScalarFieldEnum = {
  property_id: 'property_id',
  option_id: 'option_id',
  assigned_at: 'assigned_at'
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

exports.Prisma.PropertyHourlyPriceScalarFieldEnum = {
  id: 'id',
  property_id: 'property_id',
  normal: 'normal',
  wednesday: 'wednesday',
  thursday: 'thursday',
  friday: 'friday',
  peak: 'peak',
  cleaning: 'cleaning',
  additional_person: 'additional_person',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.PropertyMonthlyPriceScalarFieldEnum = {
  id: 'id',
  property_id: 'property_id',
  rent: 'rent',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.PropertyYearlyPriceScalarFieldEnum = {
  id: 'id',
  property_id: 'property_id',
  deposit: 'deposit',
  rent: 'rent',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.PropertyCalendarNoteScalarFieldEnum = {
  id: 'id',
  property_id: 'property_id',
  day: 'day',
  month: 'month',
  year: 'year',
  note: 'note',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.PropertyReservedDaysScalarFieldEnum = {
  id: 'id',
  property_id: 'property_id',
  day: 'day',
  month: 'month',
  year: 'year',
  from_hour: 'from_hour',
  to_hour: 'to_hour',
  timestamp: 'timestamp',
  is_manual: 'is_manual',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.PropertyAuthorizedScalarFieldEnum = {
  id: 'id',
  property_id: 'property_id',
  national_id: 'national_id',
  nc_image_id: 'nc_image_id',
  doc_image_id: 'doc_image_id',
  status: 'status',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.RateScalarFieldEnum = {
  id: 'id',
  creator_user_id: 'creator_user_id',
  creator_user_role: 'creator_user_role',
  rateable_id: 'rateable_id',
  rateable_type: 'rateable_type',
  rate: 'rate',
  review: 'review',
  rate_elements: 'rate_elements',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.AdminScalarFieldEnum = {
  id: 'id',
  username: 'username',
  password: 'password',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.PropertyOptionScalarFieldEnum = {
  id: 'id',
  title: 'title',
  description: 'description',
  group: 'group',
  sort: 'sort',
  created_at: 'created_at',
  updated_at: 'updated_at',
  deleted_at: 'deleted_at'
};

exports.Prisma.CityScalarFieldEnum = {
  id: 'id',
  title: 'title',
  parent_id: 'parent_id',
  created_at: 'created_at',
  updated_at: 'updated_at',
  deleted_at: 'deleted_at'
};

exports.Prisma.ContentCategoryScalarFieldEnum = {
  id: 'id',
  title: 'title',
  key: 'key',
  created_at: 'created_at',
  updated_at: 'updated_at',
  deleted_at: 'deleted_at'
};

exports.Prisma.ContentScalarFieldEnum = {
  id: 'id',
  title: 'title',
  key: 'key',
  small_text: 'small_text',
  full_text: 'full_text',
  is_active: 'is_active',
  category_id: 'category_id',
  attachment_id: 'attachment_id',
  created_at: 'created_at',
  updated_at: 'updated_at',
  deleted_at: 'deleted_at'
};

exports.Prisma.SubscriptionPlanScalarFieldEnum = {
  id: 'id',
  group: 'group',
  title: 'title',
  duration: 'duration',
  price: 'price',
  price_with_discount: 'price_with_discount',
  is_active: 'is_active',
  sort: 'sort',
  created_at: 'created_at',
  updated_at: 'updated_at',
  deleted_at: 'deleted_at'
};

exports.Prisma.StatusScalarFieldEnum = {
  id: 'id',
  title: 'title',
  step: 'step',
  group: 'group',
  color: 'color',
  description: 'description',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.TicketScalarFieldEnum = {
  id: 'id',
  user_id: 'user_id',
  role_type: 'role_type',
  title: 'title',
  message: 'message',
  reply: 'reply',
  reply_at: 'reply_at',
  created_at: 'created_at',
  updated_at: 'updated_at',
  deleted_at: 'deleted_at'
};

exports.Prisma.NotificationScalarFieldEnum = {
  id: 'id',
  title: 'title',
  body: 'body',
  user_id: 'user_id',
  topic: 'topic',
  created_at: 'created_at',
  updated_at: 'updated_at',
  deleted_at: 'deleted_at'
};

exports.Prisma.PeakDayScalarFieldEnum = {
  id: 'id',
  day: 'day',
  month: 'month',
  year: 'year',
  timestamp: 'timestamp',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.BannerScalarFieldEnum = {
  id: 'id',
  title: 'title',
  is_active: 'is_active',
  description: 'description',
  link: 'link',
  position: 'position',
  property_id: 'property_id',
  advisor_id: 'advisor_id',
  image_id: 'image_id',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.PaymentScalarFieldEnum = {
  id: 'id',
  user_id: 'user_id',
  amount: 'amount',
  gate: 'gate',
  authority: 'authority',
  ref_id: 'ref_id',
  status: 'status',
  description: 'description',
  subscription_plan_id: 'subscription_plan_id',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.MessengerChatroomScalarFieldEnum = {
  id: 'id',
  owner_rent_request_id: 'owner_rent_request_id',
  type: 'type',
  status: 'status',
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
  updated_at: 'updated_at'
};

exports.Prisma.MessengerMessagesScalarFieldEnum = {
  id: 'id',
  chatroom_id: 'chatroom_id',
  participant_id: 'participant_id',
  text: 'text',
  media_id: 'media_id',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.MessengerMediaScalarFieldEnum = {
  id: 'id',
  name: 'name',
  thumbnail: 'thumbnail',
  meta: 'meta',
  type: 'type',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.MessengerBlockedListScalarFieldEnum = {
  id: 'id',
  blocked_by_id: 'blocked_by_id',
  user_blocked_id: 'user_blocked_id',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.VersionControlScalarFieldEnum = {
  id: 'id',
  version: 'version',
  build_number: 'build_number',
  app_key: 'app_key',
  platform: 'platform',
  is_mandatory: 'is_mandatory',
  title: 'title',
  description: 'description',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.VersionControlMarketScalarFieldEnum = {
  id: 'id',
  market_name: 'market_name',
  key: 'key',
  link: 'link',
  platform: 'platform',
  version_in_market: 'version_in_market',
  icon_id: 'icon_id',
  version_control_id: 'version_control_id',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.JsonNullValueInput = {
  JsonNull: Prisma.JsonNull
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};
exports.UserRole = exports.$Enums.UserRole = {
  CUSTOMER: 'CUSTOMER',
  ADVISOR: 'ADVISOR',
  OWNER: 'OWNER'
};

exports.RentType = exports.$Enums.RentType = {
  HOURLY: 'HOURLY',
  DAILY: 'DAILY',
  MONTHLY: 'MONTHLY',
  YEARLY: 'YEARLY'
};

exports.CANCELING_TYPE = exports.$Enums.CANCELING_TYPE = {
  EASY: 'EASY',
  NORMAL: 'NORMAL',
  STRICT: 'STRICT'
};

exports.RateableType = exports.$Enums.RateableType = {
  ADVISOR: 'ADVISOR',
  PROPERTY: 'PROPERTY'
};

exports.PropertyOptionGroup = exports.$Enums.PropertyOptionGroup = {
  PROPERTY_TYPE: 'PROPERTY_TYPE',
  OWNERSHIP: 'OWNERSHIP',
  PATTERN: 'PATTERN',
  ACCESS: 'ACCESS',
  NEIGHBORHOOD: 'NEIGHBORHOOD',
  ENTERTAINMENT: 'ENTERTAINMENT',
  POOL_TYPE: 'POOL_TYPE',
  KITCHEN: 'KITCHEN',
  COOL_HEAT: 'COOL_HEAT',
  WELFARE: 'WELFARE',
  GUEST_TYPE: 'GUEST_TYPE',
  PET: 'PET',
  PARTY: 'PARTY',
  BUILDING_DIRECTION: 'BUILDING_DIRECTION'
};

exports.SubscriptionPlanGroup = exports.$Enums.SubscriptionPlanGroup = {
  PROPERTY: 'PROPERTY',
  ADVISOR: 'ADVISOR',
  CUSTOMER: 'CUSTOMER'
};

exports.StatusGroup = exports.$Enums.StatusGroup = {
  RENT: 'RENT',
  PROPERTY: 'PROPERTY'
};

exports.Position = exports.$Enums.Position = {
  ADVISOR: 'ADVISOR',
  OWNER: 'OWNER',
  MAIN: 'MAIN',
  CUSTOMER: 'CUSTOMER',
  SPECIAL_ADVISOR: 'SPECIAL_ADVISOR'
};

exports.PaymentGate = exports.$Enums.PaymentGate = {
  ZARINPAL: 'ZARINPAL',
  MYKET: 'MYKET'
};

exports.ChatroomType = exports.$Enums.ChatroomType = {
  AO: 'AO',
  AC: 'AC',
  OC: 'OC'
};

exports.Platform = exports.$Enums.Platform = {
  ANDROID: 'ANDROID',
  IOS: 'IOS',
  WEB: 'WEB'
};

exports.Prisma.ModelName = {
  Otp: 'Otp',
  User: 'User',
  Customer: 'Customer',
  Owner: 'Owner',
  Advisor: 'Advisor',
  AdvisorNote: 'AdvisorNote',
  AuthorizedUser: 'AuthorizedUser',
  Attachment: 'Attachment',
  Subscription: 'Subscription',
  RentRequest: 'RentRequest',
  OptionsOnRentRequest: 'OptionsOnRentRequest',
  OwnerRentRequest: 'OwnerRentRequest',
  OwnerRentRequestAgreement: 'OwnerRentRequestAgreement',
  Property: 'Property',
  PropertyDescription: 'PropertyDescription',
  PropertyBedroom: 'PropertyBedroom',
  OptionsOnProperty: 'OptionsOnProperty',
  PropertyDailyPrice: 'PropertyDailyPrice',
  PropertyHourlyPrice: 'PropertyHourlyPrice',
  PropertyMonthlyPrice: 'PropertyMonthlyPrice',
  PropertyYearlyPrice: 'PropertyYearlyPrice',
  PropertyCalendarNote: 'PropertyCalendarNote',
  PropertyReservedDays: 'PropertyReservedDays',
  PropertyAuthorized: 'PropertyAuthorized',
  Rate: 'Rate',
  Admin: 'Admin',
  PropertyOption: 'PropertyOption',
  City: 'City',
  ContentCategory: 'ContentCategory',
  Content: 'Content',
  SubscriptionPlan: 'SubscriptionPlan',
  Status: 'Status',
  Ticket: 'Ticket',
  Notification: 'Notification',
  PeakDay: 'PeakDay',
  Banner: 'Banner',
  Payment: 'Payment',
  MessengerChatroom: 'MessengerChatroom',
  MessengerParticipant: 'MessengerParticipant',
  MessengerMessages: 'MessengerMessages',
  MessengerMedia: 'MessengerMedia',
  MessengerBlockedList: 'MessengerBlockedList',
  VersionControl: 'VersionControl',
  VersionControlMarket: 'VersionControlMarket'
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
