export default () => ({
  server: {
    baseUrl: process.env.BASE_URL,
  },
  database: {
    url: process.env.DATABASE_URL,
  },
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
  },
  settings: {},
  url: { websiteUrl: process.env.WEBSITE_URL, advisorShareUrl: process.env.ADVISOR_SHARE_URL },
  app: {
    apiPrefix: 'api',
  },
  userAuth: {
    secret: process.env.USER_AUTH_EXPIRE,
    expire: process.env.USER_AUTH_EXPIRE,
  },
  auth: {
    secret: process.env.USER_SECRET,
    expire: process.env.USER_EXPIRE,
    guestSecret: process.env.GUEST_SECRET,
    guestExpire: process.env.GUEST_EXPIRE,
  },

  mianAuth: {
    secret: process.env.MIAN_SECRET,
  },

  adminAuth: {
    signinSecret: process.env.ADMIN_SIGNIN_SECRET,
    secret: process.env.ADMIN_AUTH_SECRET,
    expire: process.env.ADMIN_AUTH_EXPIRE,
    nonce: process.env.ADMIN_PASS_NONCE,
  },
  socket: {
    secret: process.env.SOCKET_SECRET,
    expire: process.env.SOCKET_EXPIRE,
  },
  sms: {
    smsApiToken: process.env.SMS_IR_API_TOKEN,
    verificationTemplateId: process.env.SMS_IR_VERIFY_TEMPLATE_ID,
    propertyStatusTemplateId: process.env.SMS_IR_PROPERTY_STATUS_TEMPLATE_ID,
    propertyAuthStatusTemplateId: process.env.SMS_IR_PROPERTY_AUTH_STATUS_TEMPLATE_ID,
    propertySubscriptionReminderTemplateId: process.env.SMS_IR_PROPERTY_SUBSCRIPTION_TEMPLATE_ID,
    advisorSubscriptionReminderTemplateId: process.env.SMS_IR_ADVISOR_SUBSCRIPTION_TEMPLATE_ID,
    callLogTemplateId: process.env.SMS_IR_CALL_LOG_TEMPLATE_ID,
    callLogExpiredTemplateId: process.env.SMS_IR_CALL_LOG_EXPIRED_TEMPLATE_ID,
    propertyPromoteTemplateId: process.env.SMS_IR_PROPERTY_PROMOTE_TEMPLATE_ID,
    reserveSmsTemplateId: process.env.SMS_IR_RESERVE_TEMPLATE_ID,
    sendClickGuestMobileSmsTemplateId: process.env.SMS_IR_CLICK_GUEST_MOBILE_TEMPLATE_ID,
    sendUrl: 'https://api.sms.ir/v1/send/verify',
    enableTwoStepVerification: process.env.ENABLE_ADMIN_TWO_STEP_VERIFICATION,
  },
  project: {
    maxOtpAttempts: process.env.MAX_OTP_ATTEMPTS,
    advisorShareLinkSecret: process.env.ADVISOR_SHARE_LINK_SECRET,
  },
  payment: {
    paymentCallBackUrl: process.env.PAYMENT_CALLBACK_URL,
    paymentBaseUrl: process.env.PAYMENT_BASE_URL,
    zarinpalMerchant: process.env.ZARINPAL_MERCHANT,
  },
  aws: {
    bucket: process.env.BUCKET_NAME,
    region: 'default',
    fs1: {
      endPoint: process.env.S3_FS1_ENDPOINT,
      accessKey: process.env.S3_FS1_ACCESS_KEY,
      secretKey: process.env.S3_FS1_SECRET_KEY,
    },
  },
});
