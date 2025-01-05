import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import {
  _IsInt,
  _IsNotEmpty,
  _IsString,
  _IsNumber,
  _IsBoolean
} from 'src/common/pipes/validator-translate.pipe';
import { Type } from 'class-transformer';

export class CreatePropertyAuthorizedAdminDto {
  @ApiProperty({ required: true, default: 1 })
  @_IsInt()
  @Type(() => Number)
  @_IsNotEmpty()
  property_id: number
        

  @ApiProperty({ required: true, default: 1 })
  @_IsInt()
  @Type(() => Number)
  @_IsNotEmpty()
  nc_image_id: number
        

  @ApiProperty({ required: true, default: 1 })
  @_IsInt()
  @Type(() => Number)
  @_IsNotEmpty()
  status: number
}