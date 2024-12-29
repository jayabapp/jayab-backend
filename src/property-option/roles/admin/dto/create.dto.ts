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

export class CreatePropertyOptionAdminDto {
  @ApiProperty({ required: true, default: 'لورم ایپسوم متن ساختگی' })
  @_IsString()
  @_IsNotEmpty()
  title: string
        

  @ApiProperty({ required: false, default: 'لورم ایپسوم متن ساختگی' })
  @_IsString()
  @IsOptional()
  description: string
        

  @ApiProperty({ required: true, default: 'لورم ایپسوم متن ساختگی' })
  @_IsString()
  @_IsNotEmpty()
  group: string
        

  @ApiProperty({ required: false, default: 1 })
  @_IsInt()
  @Type(() => Number)
  @IsOptional()
  sort: number
}