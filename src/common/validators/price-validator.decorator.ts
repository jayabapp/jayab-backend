import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { ValidationArguments } from 'class-validator/types/validation/ValidationArguments';
import { MAX_PROPERTY_PRICE } from 'src/common/utils/constants/constants';
import { Injectable } from '@nestjs/common';
import { RentType } from 'src/property/common/types/property-rent-types.type';

@Injectable()
@ValidatorConstraint({ name: 'IsPrice', async: true })
export class IsPrice implements ValidatorConstraintInterface {
  async validate(value: number, validationArguments: ValidationArguments) {
    const MAX_PRICE = validationArguments.constraints?.[1] ?? MAX_PROPERTY_PRICE;
    const MIN_PRICE = validationArguments.constraints?.[2] ?? 200000;
    const intValue = parseInt(`${value}`);
    if (typeof intValue !== 'number' && !Number.isInteger(intValue)) return false;
    if (intValue > MAX_PRICE || intValue < MIN_PRICE) return false;
    return true;
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    const MAX_PRICE = validationArguments.constraints[1] ?? MAX_PROPERTY_PRICE;
    const MIN_PRICE = validationArguments.constraints[2] ?? 200000;
    const { value } = validationArguments;
    const intValue = parseInt(`${value}`);
    if (!intValue) return `قیمت ${days[validationArguments.property]} را وارد نمایید`;
    if (typeof intValue !== 'number' && !Number.isInteger(intValue))
      return `قیمت وارد شده برای ${days[validationArguments.property]} صحیح نیست`;
    if (intValue > MAX_PRICE)
      return `حداکثر قیمت ${days[validationArguments.property]} ${MAX_PRICE} باید باشد`;
    if (intValue < MIN_PRICE)
      return `حداقل قیمت ${days[validationArguments.property]} ${MIN_PRICE} باید باشد`;
  }
}

const days = {
  normal: 'شنبه تا سه شنبه',
  wednesday: 'چهارشنبه',
  thursday: 'پنج شنبه',
  friday: 'جمعه',
  peak: 'ایام پیک',
  cleaning: 'هزینه نظافت',
  additional_person: 'نفر اضافه و سه سال به بالا',
  today_offer: 'پیشنهاد امروز',
  deposit: 'رهن',
};
