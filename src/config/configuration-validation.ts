import Joi from 'joi';

const configValidations = Joi.object({
  DATABASE_URL: Joi.string().required(),
  WEBSITE_URL: Joi.string().required(),
  ADVISOR_SHARE_URL: Joi.string().required(),
  BASE_URL: Joi.string().required(),
  PAYMENT_CALLBACK_URL: Joi.string().required(),
  PAYMENT_BASE_URL: Joi.string().required(),
  ZARINPAL_MERCHANT: Joi.string().required(),
  // PAYMENT_BASE_URL: Joi.string().required(),
  // REDIS_HOST: Joi.string().required(),
  // REDIS_PORT: Joi.string().required(),
  // REDIS_PASSWORD: Joi.optional(),

  USER_SECRET: Joi.string().required(),
  USER_EXPIRE: Joi.string().required(),

  GUEST_SECRET: Joi.string().required(),
  GUEST_EXPIRE: Joi.string().required(),

  USER_AUTH_SECRET: Joi.string().required(),
  USER_AUTH_EXPIRE: Joi.string().required(),

  MIAN_SECRET: Joi.string().required(),

  ADMIN_SIGNIN_SECRET: Joi.string().required(),
  ADMIN_AUTH_SECRET: Joi.string().required(),
  ADMIN_AUTH_EXPIRE: Joi.string().required(),
  ADMIN_PASS_NONCE: Joi.string().required(),

  SMS_IR_API_TOKEN: Joi.string().required(),
  SMS_IR_VERIFY_TEMPLATE_ID: Joi.string().required(),
  SMS_IR_PROPERTY_STATUS_TEMPLATE_ID: Joi.string().required(),
  SMS_IR_PROPERTY_AUTH_STATUS_TEMPLATE_ID: Joi.string().required(),
  SMS_IR_PROPERTY_SUBSCRIPTION_TEMPLATE_ID: Joi.string().required(),
  SMS_IR_ADVISOR_SUBSCRIPTION_TEMPLATE_ID: Joi.string().required(),
  SMS_IR_PROPERTY_PROMOTE_TEMPLATE_ID: Joi.string().required(),
  SMS_IR_RESERVE_TEMPLATE_ID: Joi.string().required(),
  SMS_IR_CHAT_HINT_TEMPLATE_ID: Joi.string().required(),
  SMS_IR_RECOMMENDED_PROPERTY_TEMPLATE_ID: Joi.string().required(),
  SMS_IR_RESERVE_HINT_TO_GUEST_TEMPLATE_ID: Joi.string().required(),
  NEW_TICKET_TO_ADMIN_TEMPLATE_ID: Joi.string().required(),

  AVANAK_TOKEN: Joi.string().required(),
  AVANAK_RESERVE_OWNER_MESSAGE_ID: Joi.string().required(),

  MAX_OTP_ATTEMPTS: Joi.string().required(),
  TEST_ACCESS_ENABLED: Joi.string().valid('0', '1').default('0'),
  TEST_TEAM_LEAD_MOBILE: Joi.when('TEST_ACCESS_ENABLED', {
    is: '1',
    then: Joi.string().pattern(/^09\d{9}$/).required(),
    otherwise: Joi.string().pattern(/^09\d{9}$/).allow('').optional(),
  }),

  S3_FS1_ENDPOINT: Joi.string().required(),
  S3_FS1_ACCESS_KEY: Joi.string().required(),
  S3_FS1_SECRET_KEY: Joi.string().required(),

  //Config
  APP_NAME: Joi.string().required(),
  APP_FA_NAME: Joi.string().required(),
  APP_LOGO: Joi.string().required(),

  ADVISOR_SHARE_LINK_SECRET: Joi.string().required(),
});

export default configValidations;
