import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { Injectable } from '@nestjs/common';
import Joi from 'joi';
import moment from 'moment-jalaali';
import { JALAALI_FORMAT } from '../utils/constants/date.constant';
import { isInteger } from 'lodash';
import { dateSanitizer } from '../helpers/date-sanitizer.helper';

export type DateType = {
  year: number;
  month: number;
  day: number;
};
@Injectable()
@ValidatorConstraint({ name: 'IsJalaaliDate', async: true })
export class IsJalaaliDate implements ValidatorConstraintInterface {
  async validate(value: DateType, validationArguments: ValidationArguments): Promise<boolean> {
    if (!value) return false;
    if (!value?.year || !value?.month || !value?.day) return false;
    if (!isInteger(value?.year) || !isInteger(value?.month) || !isInteger(value?.day)) return false;

    const MIN_DATE = (validationArguments?.constraints?.[2] as number) || '1300/01/01';

    // const date = `${value?.year}/0${value?.month}/${value?.day}`;
    const date = dateSanitizer(value);
    const dateUnix = moment(date, JALAALI_FORMAT).startOf('day').unix();
    const nowUnix = moment(MIN_DATE, JALAALI_FORMAT).startOf('day').unix();
    const diff = dateUnix - nowUnix;
    if (diff < 24 * 60 * 60) return false;

    const MAX_YEAR = (validationArguments?.constraints?.[1] as number) || moment().jYear();

    const schema = Joi.object({
      year: Joi.number().min(1300).max(MAX_YEAR).required(),
      month: Joi.number().min(1).max(12).required(),
      day: Joi.number().min(1).max(31).required(),
    });

    const x = schema.validate(value);
    if (x.error) return false;

    return true;
  }
  defaultMessage(validationArguments: ValidationArguments): string {
    return `${validationArguments?.constraints?.[0] || 'تاریخ'} وارد شده قابل قبول نیست`;
  }
}
