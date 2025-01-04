import { ApiProperty } from '@nestjs/swagger';
import { IsAlpha, IsObject, IsOptional, Validate } from 'class-validator';
import {
  _IsInt,
  _IsNotEmpty,
  _IsString,
  _IsNumber,
  _IsBoolean,
} from 'src/common/pipes/validator-translate.pipe';
import { Transform, Type } from 'class-transformer';
import { IsExist } from 'src/common/validators/is-exists.validator';

export class CreateContentCategoryAdminDto {
  @ApiProperty({ required: true, default: 'قوانین' })
  @_IsString()
  @_IsNotEmpty()
  title: string;

  @ApiProperty({ required: true, default: 'terms' })
  @Transform(({ value }) => value?.trim()?.replace(/ /g, ''))
  @_IsString()
  // @IsAlpha()
  @_IsNotEmpty()
  key: string;

  @ApiProperty({ required: false, default: 1 })
  @_IsInt()
  @Type(() => Number)
  @IsOptional()
  image_id: number;

  @ApiProperty({ required: true, title: 'والد' })
  @_IsInt()
  @Validate(IsExist, ['contentCategory', 'id'], { message: 'دسته بندی انتخاب شده وجود ندارد' })
  @IsOptional()
  parent_id: number;

  @ApiProperty({ required: true, title: 'توضیحات' })
  @_IsString()
  @IsOptional()
  description: string;

  @ApiProperty({ required: false, default: '<p>تست</p>' })
  @_IsString()
  @IsOptional()
  html: string;

  @ApiProperty({ required: true, default: true })
  @_IsBoolean()
  @_IsNotEmpty()
  show_in_sitemap: boolean;

  @ApiProperty({ title: 'فیلدهای seo' })
  @IsOptional()
  @IsObject()
  seo: object;
}
