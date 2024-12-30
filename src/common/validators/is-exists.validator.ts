import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { ValidationArguments } from 'class-validator/types/validation/ValidationArguments';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
@ValidatorConstraint({ name: 'IsExist', async: true })
export class IsExist implements ValidatorConstraintInterface {
  constructor(private readonly db: PrismaService) {}

  async validate(value: string | number, validationArguments: ValidationArguments): Promise<boolean> {
    // if (!value || (typeof value != 'number' && typeof value != 'string')) return false;
    if (!value || typeof value != 'number') return false;

    const repository = validationArguments.constraints[0] as string;
    const pathToProperty = validationArguments.constraints[1];
    const additionalQuery = validationArguments.constraints[2] || {};

    const entity: unknown = await this.db[repository].findFirst({
      where: {
        [pathToProperty ?? validationArguments.property]: value,
        ...additionalQuery,
      },
    });

    return Boolean(entity);
  }
  defaultMessage(validationArguments?: ValidationArguments): string {
    return `${validationArguments.property} یافت نشد`;
  }
}
