import { _MinLength, _MaxLength, _IsString } from 'src/common/pipes/validator-translate.pipe';
import { WithTitleTranslationsDto } from 'src/common/dto/title-translations.dto';
import { IsOptional, Validate } from 'class-validator';
import { _IsNotEmpty, _IsInt } from 'src/common/pipes/validator-translate.pipe';
import { ApiProperty } from '@nestjs/swagger';
import { IsExist } from 'src/common/validators/is-exists.validator';
import { Type } from 'class-transformer';

export class CreateCityAdminDto extends WithTitleTranslationsDto {
  @ApiProperty({ required: true, example: 'عنوان تست' })
  @_MinLength(1)
  @_MaxLength(50)
  @_IsString()
  @_IsNotEmpty()
  title: string;

  @ApiProperty({ required: false, example: 1 })
  @Validate(IsExist, ['city', 'id'])
  @_IsInt()
  @IsOptional()
  parent_id: number;

  @ApiProperty({ required: false, example: 1 })
  @_IsInt()
  @IsOptional()
  sort_order: number;

  @ApiProperty({ required: true, example: '' })
  @_IsString()
  @IsOptional()
  slug: string;

  @ApiProperty({ required: false, example: 1 })
  @Type(() => Number)
  @Validate(IsExist, ['attachment', 'id'])
  @_IsInt()
  @IsOptional()
  image_id: number;
}
