import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { Injectable } from '@nestjs/common';
import Joi from 'joi';

@Injectable()
@ValidatorConstraint({ name: 'IsNationalId', async: true })
export class IsNationalId implements ValidatorConstraintInterface {
  async validate(value: string): Promise<boolean> {
    if (!value) return false;
    //check length and numeric string
    const schema = Joi.string()
      .pattern(/^[0-9]+$/)
      .min(10)
      .max(10);
    const x = schema.validate(value);
    if (x.error) return false;

    /**
     * - National id algorithm
     * - logic: http://www.aliarash.com/article/codemeli/codemeli.htm
     */
    let sum = 0;
    let controlNumber: number;

    for (let i = 0; i < 9; i++) {
      sum += Number(value[i]) * (10 - i);
    }
    const remaining = sum % 11;
    if (remaining >= 2) controlNumber = 11 - remaining;
    else controlNumber = remaining;
    if (Number(value[9]) !== controlNumber) return false;

    return true;
  }
  defaultMessage(): string {
    return `کد ملی وارد شده صحیح نمی باشد`;
  }
}
