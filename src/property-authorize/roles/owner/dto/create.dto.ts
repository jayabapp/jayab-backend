import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import {
  _IsInt,
  _IsNotEmpty,
  _IsString,
  _IsNumber,
  _IsBoolean,
  _ArrayNotEmpty,
} from 'src/common/pipes/validator-translate.pipe';
import { Type } from 'class-transformer';

export class CreatePropertyAuthorizeOwnerDto {
  @ApiProperty({ required: true, example: 1 })
  @_IsInt()
  @Type(() => Number)
  @_IsNotEmpty()
  property_id: number;

  @ApiProperty({ required: true, example: 1 })
  @_IsInt()
  @Type(() => Number)
  @_IsNotEmpty()
  nc_image_id: number;

  @ApiProperty({ required: true, example: [1] })
  @_ArrayNotEmpty()
  docs: number[];
}
