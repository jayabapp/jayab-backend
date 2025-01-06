import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import {
  _IsInt,
  _IsNotEmpty,
  _IsString,
  _IsNumber,
  _IsBoolean,
  _MaxLength,
  _MinLength,
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
