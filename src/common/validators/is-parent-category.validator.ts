import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
@ValidatorConstraint({ name: 'IsParentCategory', async: true })
export class IsParentCategory implements ValidatorConstraintInterface {
  constructor(private readonly db: PrismaService) {}

  async validate(value: string): Promise<boolean> {
    if (!value) return false;

    const category = await this.db.category.findUnique({ where: { key: value } });
    if (!category || category?.parent_id) return false; // if the category has parent_id, that means this category is not a parent category. parent categories do not have parent_id

    return true;
  }
  defaultMessage(): string {
    return `شناسه دسته بندی اصلی وارد شده اشتباه است`;
  }
}
