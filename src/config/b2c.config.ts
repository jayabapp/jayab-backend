import { BadRequestException } from '@nestjs/common';

export type B2CConfigKey = {
  APP_FA_NAME: string;
  APP_LOGO: string;
  IS_MARKETPLACE: '0' | '1';
  BUSINESS_NAME: string;
  BUSINESS_ADDRESS: string;
  BUSINESS_LATITUDE: string;
  BUSINESS_LONGITUDE: string;
  HAS_MULTI_PRODUCT_ATTRIBUTE: '0' | '1';
  MAIN_ATTRIBUTE_GROUP: string;
  HAS_OFFER_CODE: '0' | '1';
  HAS_PAYMENT: '0' | '1';
};

export function getB2cConfig<T extends keyof B2CConfigKey>(key: T): B2CConfigKey[T] {
  // const value = (conf as B2CConfigKey)[key];
  const value = (process.env as unknown as B2CConfigKey)[key];

  if (value == null || value == undefined) throw new BadRequestException(`Config -> ${key}: does not exist`);
  return value;
}
