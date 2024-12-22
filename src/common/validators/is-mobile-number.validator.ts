import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { Injectable } from '@nestjs/common';
import Joi from 'joi';

@Injectable()
@ValidatorConstraint({ name: 'IsMobileNumber', async: true })
export class IsMobileNumber implements ValidatorConstraintInterface {
  async validate(value: string | number): Promise<boolean> {
    if (!value || typeof value != 'string') return false;

    const schema = Joi.string()
      .pattern(/09(0[0-5]|1[0-9]|3[0-9]|2[0-9]|9[0-9])-?[0-9]{3}-?[0-9]{4}/)
      .length(11);

    const x = schema.validate(value);
    if (x.error) return false;
    return true;
  }
  defaultMessage(): string {
    return `شماره موبایل وارد شده صحیح نمی باشد`;
  }
}
