import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
@ValidatorConstraint({ name: 'IsSubCategory', async: true })
export class IsSubCategory implements ValidatorConstraintInterface {
  constructor(private readonly db: PrismaService) {}

  async validate(value: number): Promise<boolean> {
    if (!value || !Number.isInteger(value)) return false;

    const category = await this.db.category.findUnique({ where: { id: +value, parent_id: { not: null } } });
    if (!category) return false; // if the category does not have parent_id, that means this category is parent category.

    return true;
  }
  defaultMessage(): string {
    return `شناسه دسته بندی فرعی وارد شده اشتباه است`;
  }
}
