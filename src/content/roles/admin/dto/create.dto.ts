import { ApiProperty } from '@nestjs/swagger';
import { IsAlpha, IsObject, IsOptional } from 'class-validator';
import {
  _IsInt,
  _IsNotEmpty,
  _IsString,
  _IsBoolean,
  _IsArray,
} from 'src/common/pipes/validator-translate.pipe';
import { Transform, Type } from 'class-transformer';

export class CreateContentAdminDto {
  @ApiProperty({ required: true, default: 'عنوان' })
  @_IsString()
  @_IsNotEmpty()
  title: string;

  @ApiProperty({ required: false, default: 'tel' })
  // @IsAlpha()
  @Transform(({ value }) => value?.trim()?.replace(/ /g, ''))
  @IsOptional()
  key: string;

  @ApiProperty({ required: true, default: '' })
  @Transform(({ value }) => value?.trim()?.replace(/ /g, ''))
  @_IsNotEmpty()
  slug: string;

  @ApiProperty({ required: false, default: 'لورم ایپسوم متن ساختگی' })
  @_IsString()
  @IsOptional()
  small_text: string;

  @ApiProperty({ required: false, default: 'لورم ایپسوم متن ساختگی' })
  @_IsString()
  @IsOptional()
  full_text: string;

  @ApiProperty({ required: false, default: '<p>تست</p>' })
  @_IsString()
  @IsOptional()
  html: string;

  @ApiProperty({ required: false, default: 1 })
  @Transform(({ value }) => {
    if (!value) return null;
    return value;
  })
  @_IsInt()
  @Type(() => Number)
  @IsOptional()
  feature_image_id: number;

  @ApiProperty({ required: false, default: 1 })
  @Transform(({ value }) => {
    if (!value) return null;
    return value;
  })
  @_IsInt()
  @Type(() => Number)
  @IsOptional()
  video_id: number;

  @ApiProperty({ required: true, default: true })
  @_IsBoolean()
  @_IsNotEmpty()
  is_active: boolean;

  @ApiProperty({ required: true, default: true })
  @_IsBoolean()
  @_IsNotEmpty()
  show_in_sitemap: boolean;

  @ApiProperty({ required: true, default: 1 })
  @_IsInt()
  @Type(() => Number)
  @IsOptional()
  category_id: number;

  @ApiProperty({ title: 'عکس های بیشتر', default: [1] })
  @IsOptional()
  @_IsArray()
  attachments: number[];

  @ApiProperty({ title: 'فیلدهای اضافی' })
  @IsOptional()
  @IsObject()
  fields: object;

  @ApiProperty({ title: 'فیلدهای seo' })
  @IsOptional()
  @IsObject()
  seo: object;

  @ApiProperty({ title: 'ترتیب' })
  @_IsInt()
  @IsOptional()
  order: number;

  @ApiProperty({ title: 'لینک' })
  @_IsString()
  @IsOptional()
  link: string;
}
