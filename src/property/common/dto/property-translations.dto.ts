import { IsObject, IsOptional, ValidateNested } from 'class-validator';
import { _IsNotEmpty, _IsString, _MaxLength } from 'src/common/pipes/validator-translate.pipe';
import { Transform, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class PropertyTranslationDto {
  @ApiProperty({ required: false })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @_IsString()
  @_IsNotEmpty()
  @_MaxLength(200)
  @IsOptional()
  title?: string;

  @ApiProperty({ required: false })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @_IsString()
  @_IsNotEmpty()
  @_MaxLength(1000)
  @IsOptional()
  address?: string;
}

export class PropertyTranslationsDto {
  @ApiProperty({ required: false, type: PropertyTranslationDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => PropertyTranslationDto)
  ar?: PropertyTranslationDto;

  @ApiProperty({ required: false, type: PropertyTranslationDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => PropertyTranslationDto)
  en?: PropertyTranslationDto;
}
