import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { ValidationArguments } from 'class-validator/types/validation/ValidationArguments';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { isEmpty, isInteger } from 'lodash';
import { PropertyOptionGroup } from 'src/property-option/common/property-option-groups.type';
import { PropertyOptionGroupLabels } from '../interfaces/proprty-option-group-labels';

@Injectable()
@ValidatorConstraint({ name: 'IsCorrectPropertyOption', async: true })
export class IsCorrectPropertyOption implements ValidatorConstraintInterface {
  constructor(private readonly db: PrismaService) {}

  async validate(value: any, validationArguments: ValidationArguments) {
    // if(!value) return false

    if (!Array.isArray(value) && !isInteger(value)) return false;
    if (Array.isArray(value) && isEmpty(value)) return true;
    if (Array.isArray(value)) {
      let notInteger = false;
      value.map((e) => {
        if (!isInteger(e)) notInteger = true;
      });
      if (notInteger) return false;
    }

    const group: PropertyOptionGroup = validationArguments.constraints[0];
    const formattedValue = Array.isArray(value) ? value : [value];
    const queryCount = await this.db.propertyOption.count({
      where: { id: { in: formattedValue }, group: group },
    });

    if (Array.isArray(value) && queryCount == value?.length) return true;
    if (!Array.isArray(value) && queryCount > 0) return true;
    return false;
  }
  defaultMessage(validationArguments?: ValidationArguments): string {
    const group = validationArguments.constraints[0];
    const isArray = Array.isArray(validationArguments.value);

    return `${isArray ? 'موارد' : 'مورد'} انتخاب شده در ${PropertyOptionGroupLabels.get(group)} اشتباه است`;
  }
}
