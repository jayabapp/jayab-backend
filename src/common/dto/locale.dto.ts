import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { _IsIn } from 'src/common/pipes/validator-translate.pipe';

export type Locale = 'fa' | 'ar' | 'en';

export class LocaleDto {
  @ApiProperty({ required: false, enum: ['fa', 'ar', 'en'], default: 'fa' })
  @_IsIn(['fa', 'ar', 'en'])
  @IsOptional()
  locale?: Locale;
}
