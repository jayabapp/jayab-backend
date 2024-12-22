import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { Injectable } from '@nestjs/common';
import Joi from 'joi';

@Injectable()
@ValidatorConstraint({ name: 'IsCreditCard', async: true })
export class IsCreditCard implements ValidatorConstraintInterface {
  async validate(value: string): Promise<boolean> {
    if (!value) return false;
    //check length and numeric string
    const schema = Joi.string()
      .pattern(/^[0-9]+$/)
      .min(16)
      .max(16);
    const x = schema.validate(value);
    if (x.error) return false;

    /**
     * - Credit Card algorithm
     * - logic: http://www.aliarash.com/article/creditcart/credit-debit-cart.htm
     */
    let sum = 0;

    for (let i = 0; i < 16; i++) {
      const c = (i + 1) % 2 == 0 ? 1 : 2; //coefficient
      const m = Number(value[i]) * c; //multiplication
      sum += m > 9 ? m - 9 : m;
    }

    if (sum % 10 != 0) return false;

    return true;
  }
  defaultMessage(): string {
    return `شماره کارت وارد شده صحیح نمی باشد`;
  }
}
