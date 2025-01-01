import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { ValidationArguments } from 'class-validator/types/validation/ValidationArguments';
import { Injectable } from '@nestjs/common';
import { RentType } from 'src/property/common/types/property-rent-types.type';

@Injectable()
@ValidatorConstraint({ name: 'IsPrice', async: true })
export class IsPrice implements ValidatorConstraintInterface {
  async validate(value: number, validationArguments: ValidationArguments) {
    const MAX_PRICE = validationArguments.constraints[1] ?? 1000000000;
    const MIN_PRICE = validationArguments.constraints[2] ?? 200000;

    // const rentType: RentType[] = validationArguments?.object['rent_type'] ?? [];
    // const type = Array.isArray(validationArguments.constraints)
    //   ? validationArguments.constraints[0]
    //   : undefined;
    // if (!rentType?.includes(type)) return true; //check type - validate if
    // if (!intValue) return false;
    const intValue = parseInt(`${value}`);
    if (typeof intValue !== 'number' && !Number.isInteger(intValue)) return false;
    if (intValue > MAX_PRICE || intValue < MIN_PRICE) return false;
    return true;
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    const MAX_PRICE = validationArguments.constraints[1] ?? 1000000000;
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

  // h_normal: 'یک ساعت شنبه تا سه شنبه',
  // h_wednesday: 'یک ساعت چهارشنبه',
  // h_thursday: 'یک ساعت پنج شنبه',
  // h_friday: 'یک ساعت جمعه',
  // h_peak: 'یک ساعت ایام پیک',
  // h_cleaning: 'یک ساعت هزینه نظافت',
  // h_additional_person: 'یک ساعت نفر اضافه و سه سال به بالا',

  // one_month_rent: 'اجاره یک ماه',

  // rent: 'اجاره ماهانه',
  deposit: 'رهن',
};
