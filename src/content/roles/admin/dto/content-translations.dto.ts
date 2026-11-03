import { IsObject, IsOptional, ValidateNested } from 'class-validator';
import { Transform, TransformFnParams, Type } from 'class-transformer';
import { _IsNotEmpty, _IsString, _MaxLength } from 'src/common/pipes/validator-translate.pipe';
import { ApiProperty } from '@nestjs/swagger';

const trimText = ({ value }: TransformFnParams): unknown =>
  typeof value === 'string' ? value.trim() : value;

export class ContentTranslationSeoDto {
  @ApiProperty({ title: 'عنوان سئو', example: 'Rent villas and stays across Iran' })
  @Transform(trimText)
  @_IsString()
  @_IsNotEmpty()
  @_MaxLength(200)
  metaTitle: string;

  @ApiProperty({ title: 'توضیحات سئو' })
  @Transform(trimText)
  @_IsString()
  @_IsNotEmpty()
  @_MaxLength(1000)
  metaDescription: string;
}

export class ContentTranslationDto {
  @ApiProperty({ title: 'عنوان' })
  @Transform(trimText)
  @_IsString()
  @_IsNotEmpty()
  @_MaxLength(200)
  title: string;

  // The fields below are optional because short CMS entries (footer copy, link titles)
  // have no body or SEO; the public serializer still requires every part the Persian uses.
  @ApiProperty({ title: 'عنوان بخش محتوای صفحه', required: false })
  @Transform(trimText)
  @IsOptional()
  @_IsString()
  @_IsNotEmpty()
  @_MaxLength(1000)
  small_text?: string;

  @ApiProperty({ title: 'شعار بنر', required: false })
  @Transform(trimText)
  @IsOptional()
  @_IsString()
  @_IsNotEmpty()
  @_MaxLength(10000)
  full_text?: string;

  @ApiProperty({ title: 'متن صفحه', required: false })
  @IsOptional()
  @_IsString()
  @_MaxLength(200000)
  html?: string;

  @ApiProperty({ title: 'سئو', type: ContentTranslationSeoDto, required: false })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ContentTranslationSeoDto)
  seo?: ContentTranslationSeoDto;
}

export class ContentTranslationsDto {
  @ApiProperty({ title: 'عربی', required: false, type: ContentTranslationDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ContentTranslationDto)
  ar?: ContentTranslationDto;

  @ApiProperty({ title: 'انگلیسی', required: false, type: ContentTranslationDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ContentTranslationDto)
  en?: ContentTranslationDto;
}
