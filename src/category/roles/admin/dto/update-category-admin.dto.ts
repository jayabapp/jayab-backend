import { PartialType } from '@nestjs/swagger';
import { CreateCategoryAdminDto } from './create-category-admin.dto';

export class UpdateCategoryAdminDto extends PartialType(CreateCategoryAdminDto) {}
