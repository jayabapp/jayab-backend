import { IsObject, IsOptional, ValidateNested } from 'class-validator';
import { _IsNotEmpty, _IsString, _MaxLength } from 'src/common/pipes/validator-translate.pipe';
import { Transform, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class TitleTranslationDto {
  @ApiProperty({ example: 'Villa' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @_IsString()
  @_IsNotEmpty()
  @_MaxLength(200)
  title: string;
}

export class TitleTranslationsDto {
  @ApiProperty({ required: false, type: TitleTranslationDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => TitleTranslationDto)
  ar?: TitleTranslationDto;

  @ApiProperty({ required: false, type: TitleTranslationDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => TitleTranslationDto)
  en?: TitleTranslationDto;
}

export class WithTitleTranslationsDto {
  @ApiProperty({ required: false, type: TitleTranslationsDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => TitleTranslationsDto)
  translations?: TitleTranslationsDto;
}
