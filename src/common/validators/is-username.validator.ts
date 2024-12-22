import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { Injectable } from '@nestjs/common';
import Joi from 'joi';

@Injectable()
@ValidatorConstraint({ name: 'IsUsername', async: true })
export class IsUsername implements ValidatorConstraintInterface {
  async validate(value: string): Promise<boolean> {
    if (!value) return false;

    //check length and numeric string
    const schema = Joi.string()
      .pattern(/^[a-zA-Z0-9]+([_]?[a-zA-Z0-9])*$/)
      .min(4)
      .max(30);
    const x = schema.validate(value);
    if (x.error) return false;

    return true;
  }
  defaultMessage(): string {
    return `نام کاربری وارد شده قابل قبول نیست`;
  }
}
