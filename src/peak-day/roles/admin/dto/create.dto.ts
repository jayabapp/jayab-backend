import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import {
  _IsInt,
  _IsNotEmpty,
  _IsString,
  _IsNumber,
  _IsBoolean,
} from 'src/common/pipes/validator-translate.pipe';
import { Type } from 'class-transformer';
import { JalaaliDateDto } from 'src/common/dto/jalaali-date.dto';

export class CreatePeakDayAdminDto extends JalaaliDateDto {
  // @ApiProperty({ required: true, default: 'لورم ایپسوم متن ساختگی' })
  // @_IsBoolean()
  // @_IsNotEmpty()
  // is_nowruz: boolean
}
