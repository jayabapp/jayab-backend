import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { isInteger } from 'lodash';

@Injectable()
@ValidatorConstraint({ name: 'IsIdNumber', async: true })
export class IsIdNumber implements ValidatorConstraintInterface {
  constructor(private readonly db: PrismaService) {}

  async validate(value: number): Promise<boolean> {
    value = +value;
    if (!value || isNaN(value) || value <= 0 || !isInteger(value)) return false;

    return true;
  }
  defaultMessage(): string {
    return 'شناسه وارد شده معتبر نیست';
  }
}
