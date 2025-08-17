import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import {
  _IsInt,
  _IsNotEmpty,
  _IsString,
  _IsNumber,
  _IsBoolean,
  _Min,
  _Max,
} from 'src/common/pipes/validator-translate.pipe';
import { Type } from 'class-transformer';

export class CreatePeakDayAdminDto {
  @ApiProperty({ required: true, example: 1 })
  @_IsInt()
  @Type(() => Number)
  @_IsNotEmpty()
  day: number;

  @ApiProperty({ required: true, example: 1 })
  @_IsInt()
  @Type(() => Number)
  @_IsNotEmpty()
  month: number;

  @ApiProperty({ required: true, example: 1 })
  @_IsInt()
  @Type(() => Number)
  @_IsNotEmpty()
  year: number;

  @ApiProperty({ required: true, example: 'لورم ایپسوم متن ساختگی' })
  @_IsBoolean()
  @IsOptional()
  is_nowruz: boolean;
}
