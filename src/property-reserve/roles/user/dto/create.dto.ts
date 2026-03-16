import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import {
  _IsInt,
  _IsNotEmpty,
  _IsString,
  _IsNumber,
  _IsBoolean,
  _IsDate,
  _IsEnum,
} from 'src/common/pipes/validator-translate.pipe';
import { Type } from 'class-transformer';
import { ReserveUserAction } from 'src/property-reserve/common/interfaces/reserve-user-action.enum';

export class CreatePropertyReserveUserDto {
  @ApiProperty({ required: true, example: 535 })
  @_IsInt()
  @Type(() => Number)
  @_IsNotEmpty()
  property_id: number;

  @ApiProperty({ required: true, example: '5' })
  @_IsString()
  @_IsNotEmpty()
  guests_count: string;

  @ApiProperty({ required: true, example: '2026-03-21T00:00:00.000Z' })
  @_IsDate()
  @Type(() => Date)
  @_IsNotEmpty()
  check_in: Date;

  @ApiProperty({ required: true, example: '2026-03-23T00:00:00.000Z' })
  @_IsDate()
  @Type(() => Date)
  @_IsNotEmpty()
  check_out: Date;

  @ApiProperty({ required: true, example: ReserveUserAction.CALL })
  @_IsEnum(ReserveUserAction)
  @_IsNotEmpty()
  user_action: ReserveUserAction;

  @ApiProperty({ required: false, example: '' })
  @_IsString()
  @IsOptional()
  description: string;
}
