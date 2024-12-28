import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, Validate } from 'class-validator';
import {
  _MinLength,
  _MaxLength,
  _IsString,
  _IsNotEmpty,
  _IsInt,
} from 'src/common/pipes/validator-translate.pipe';
import { IsExist } from 'src/common/validators/is-exists.validator';

export class CreateCityAdminDto {
  @ApiProperty({ required: true, default: 'عنوان تست' })
  @_MinLength(1)
  @_MaxLength(50)
  @_IsString()
  @_IsNotEmpty()
  title: string;

  @ApiProperty({ required: false, default: 1 })
  @Validate(IsExist, ['city', 'id'])
  @_IsInt()
  @IsOptional()
  parent_id: number;

  @ApiProperty({ required: false, default: 1 })
  @_IsInt()
  @IsOptional()
  sort_order: number;
}
