import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { ValidationArguments } from 'class-validator/types/validation/ValidationArguments';
import { Injectable } from '@nestjs/common';
import { p2e } from '../helpers/p2e.helper';
import { PROPS } from '../pipes/validator-translate.pipe';

export type TextInputValidatorType = {
  onlyFa?: boolean;
  noNumbers?: boolean;
};

@Injectable()
@ValidatorConstraint({ name: 'TextInputValidator', async: true })
export class TextInputValidator implements ValidatorConstraintInterface {
  constructor(
    private errMsg: string,
    private propertyFaName: string,
  ) {}

  async validate(value: string, validationArguments: ValidationArguments): Promise<boolean> {
    if (typeof value != 'string') {
      return false;
    }

    const { onlyFa, noNumbers }: TextInputValidatorType = validationArguments.constraints[0];
    this.propertyFaName = PROPS[validationArguments?.property] || 'فیلد';
    value = p2e(value).trim();

    // برای حالتی که ولیدیتور آپشنال هست و دیتا استرینگ خالی
    if (value.length < 1 || value == null) {
      return true;
    }

    if (onlyFa) {
      const r = /^[\u0600-\u06FF0-9\s]+$/;
      if (!r.test(value)) {
        this.errMsg = `برای ${this.propertyFaName} لطفا از حروف فارسی استفاده کنید`;
        // this.errMsg = `${this.propertyFaName} فقط می‌تواند شامل حروف فارسی باشد`;
        return false;
      }
    }

    if (noNumbers) {
      const hasNumber = /[0-9]/.test(value);
      if (hasNumber) {
        this.errMsg = `${this.propertyFaName} نباید شامل اعداد باشد`;
        return false;
      }
    }

    // if (min > 0) {
    //   if (value.length < min) {
    //     this.errMsg = `تعداد کاراکترهای "${this.propertyFaName}" نباید از ${min} کمتر باشد.`;
    //     return false;
    //   }
    // }

    // if (max > 0) {
    //   if (value.length > max) {
    //     this.errMsg = `تعداد کاراکترهای "${this.propertyFaName}" نباید از ${max} بیشتر باشد.`;
    //     return false;
    //   }
    // }

    return true;
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    return this.errMsg || `${this.propertyFaName} وارد شده معتبر نیست`;
  }
}
