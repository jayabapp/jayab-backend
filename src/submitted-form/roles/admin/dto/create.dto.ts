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

export class CreateSubmittedFormAdminDto {
  @ApiProperty({ required: true, default: 1 })
  @_IsInt()
  @Type(() => Number)
  @_IsNotEmpty()
  content_id: number
        

  @ApiProperty({ required: false, default: '09120000000' })
  @_IsString()
  @IsOptional()
  mobile_number: string
        

  @ApiProperty({ required: false, default: 'لورم ایپسوم متن ساختگی' })
  @_IsString()
  @IsOptional()
  full_name: string
        

  @ApiProperty({ required: false, default: 'لورم ایپسوم متن ساختگی' })
  @_IsString()
  @IsOptional()
  ip: string
        

  @ApiProperty({ required: true, default: 1 })
  @_IsInt()
  @Type(() => Number)
  @_IsNotEmpty()
  status: number
}