import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { _IsIn } from 'src/common/pipes/validator-translate.pipe';

export type ContentLocale = 'fa' | 'ar' | 'en';

export class ContentLocaleDto {
  @ApiProperty({ title: 'زبان محتوا', required: false, enum: ['fa', 'ar', 'en'], default: 'fa' })
  @_IsIn(['fa', 'ar', 'en'])
  @IsOptional()
  locale?: ContentLocale;
}
