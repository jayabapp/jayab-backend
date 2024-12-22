import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { ValidationArguments } from 'class-validator/types/validation/ValidationArguments';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
@ValidatorConstraint({ name: 'IsNotExist', async: true })
export class IsNotExist implements ValidatorConstraintInterface {
  constructor(private readonly db: PrismaService) {}

  async validate(value: string | number, validationArguments: ValidationArguments): Promise<boolean> {
    if (!value || (typeof value != 'number' && typeof value != 'string')) return false;
    const repository = validationArguments.constraints[0] as string;

    const entity = await this.db[repository].findFirst({
      where: {
        [validationArguments.property]: value,
      },
    });

    return !entity;
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    return `${
      validationArguments.constraints[1] || validationArguments.property
    } تکراری است و امکان ثبت ندارد`;
  }
}
