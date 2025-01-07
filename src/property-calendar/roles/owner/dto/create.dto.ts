import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import {
  _IsInt,
  _IsNotEmpty,
  _IsString,
  _IsNumber,
  _IsBoolean,
  _MaxLength,
  _Max,
  _Min,
} from 'src/common/pipes/validator-translate.pipe';
import { Type } from 'class-transformer';
import { JalaaliDateDto } from 'src/common/dto/jalaali-date.dto';

export class CreatePropertyCalendarNoteOwnerDto extends JalaaliDateDto {
  @ApiProperty({ required: true, title: 'توضیحات', example: 'توضیحات' })
  @_IsString()
  @_MaxLength(1000)
  @IsOptional()
  note: string;
}

export class UpdatePropertyReservedStatusOwnerDto extends JalaaliDateDto {}

//also is in update property steps
export class UpdatePropertyAdvisorCommissionOwnerDto extends JalaaliDateDto {
  @ApiProperty({ required: true, title: 'کمیسیون مشاور', default: 5 })
  @_IsInt()
  @_Max(50)
  @_Min(0)
  @_IsNotEmpty()
  advisor_commission: number;
}
