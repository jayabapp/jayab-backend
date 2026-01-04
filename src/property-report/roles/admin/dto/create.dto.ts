import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { _IsBoolean, _IsInt, _IsNotEmpty, _IsString } from 'src/common/pipes/validator-translate.pipe';
import { LOREM_IPSUM_TITLE } from 'src/common/utils/constants/faker.constant';

export class CreatePropertyReportAdminDto {
  @ApiProperty({ required: true, example: 1 })
  @_IsInt()
  @Type(() => Number)
  @_IsNotEmpty()
  user_id: number;

  @ApiProperty({ required: true, example: 1 })
  @_IsInt()
  @Type(() => Number)
  @_IsNotEmpty()
  property_id: number;

  @ApiProperty({ required: true, example: LOREM_IPSUM_TITLE })
  @_IsString()
  @_IsNotEmpty()
  title: string;

  @ApiProperty({ required: false, example: LOREM_IPSUM_TITLE })
  @_IsString()
  @IsOptional()
  description: string;

  @ApiProperty({ required: true, example: LOREM_IPSUM_TITLE })
  @_IsBoolean()
  @_IsNotEmpty()
  seen_by_admin: boolean;
}
