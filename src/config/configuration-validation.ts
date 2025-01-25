import Joi from 'joi';

const configValidations = Joi.object({
  DATABASE_URL: Joi.string().required(),
  WEBSITE_URL: Joi.string().required(),
  ADVISOR_SHARE_URL: Joi.string().required(),
  BASE_URL: Joi.string().required(),
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

  ADMIN_SIGNIN_SECRET: Joi.string().required(),
  ADMIN_AUTH_SECRET: Joi.string().required(),
  ADMIN_AUTH_EXPIRE: Joi.string().required(),
  ADMIN_PASS_NONCE: Joi.string().required(),

  SMS_IR_API_TOKEN: Joi.string().required(),
  SMS_IR_VERIFY_TEMPLATE_ID: Joi.string().required(),
  SMS_IR_PROPERTY_STATUS_TEMPLATE_ID: Joi.string().required(),
  SMS_IR_PROPERTY_AUTH_STATUS_TEMPLATE_ID: Joi.string().required(),

  MAX_OTP_ATTEMPTS: Joi.string().required(),

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
