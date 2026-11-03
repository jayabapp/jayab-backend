import { _IsInt, _IsNotEmpty, _IsString, _IsEnum, _Length } from 'src/common/pipes/validator-translate.pipe';
import { WithTitleTranslationsDto } from 'src/common/dto/title-translations.dto';
import { PropertyOptionGroup } from 'src/property-option/common/property-option-groups.type';
import { Transform, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class CreatePropertyOptionAdminDto extends WithTitleTranslationsDto {
  @ApiProperty({ required: true, example: 'عنوان' })
  @_Length(1, 128)
  @_IsString()
  @_IsNotEmpty()
  title: string;

  @ApiProperty({ required: true, example: 'توضیحات' })
  @_Length(0, 256)
  @_IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ required: true })
  @_IsEnum(PropertyOptionGroup)
  @_IsNotEmpty()
  group: PropertyOptionGroup;

  @ApiProperty({ example: 'ترتیب' })
  @_IsInt()
  @Transform(({ value }) => value || 0)
  @IsOptional()
  sort?: number;

  @ApiProperty({ example: 'تصویر' })
  @_IsInt()
  @Type(() => Number)
  @IsOptional()
  image_id?: number;

  @ApiProperty({ required: false, example: '' })
  @_Length(0, 128)
  @_IsString()
  @IsOptional()
  key?: string;
}
