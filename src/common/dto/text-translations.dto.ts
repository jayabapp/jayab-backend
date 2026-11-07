import { IsObject, IsOptional, ValidateNested } from 'class-validator';
import { _IsString, _MaxLength } from 'src/common/pipes/validator-translate.pipe';
import { Transform, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

const trim = ({ value }) => (typeof value === 'string' ? value.trim() : value);

export class TextTranslationDto {
  @ApiProperty({ required: false, example: 'Gold plan' })
  @Transform(trim)
  @_IsString()
  @_MaxLength(200)
  @IsOptional()
  title?: string;

  @ApiProperty({ required: false })
  @Transform(trim)
  @_IsString()
  @_MaxLength(10000)
  @IsOptional()
  description?: string;

  @ApiProperty({ required: false, example: 'Best value' })
  @Transform(trim)
  @_IsString()
  @_MaxLength(100)
  @IsOptional()
  ribbon_title?: string;
}

export class TextTranslationsDto {
  @ApiProperty({ required: false, type: TextTranslationDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => TextTranslationDto)
  ar?: TextTranslationDto;

  @ApiProperty({ required: false, type: TextTranslationDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => TextTranslationDto)
  en?: TextTranslationDto;
}
