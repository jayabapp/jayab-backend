import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import {
  _IsInt,
  _IsNotEmpty,
  _IsString,
  _IsNumber,
  _IsBoolean,
} from 'src/common/pipes/validator-translate.pipe';
import { Transform, Type } from 'class-transformer';

export class CreateRedirectUrlAdminDto {
  @ApiProperty({ required: true })
  @Transform(({ value }) => decodeURI(value))
  @_IsString()
  @_IsNotEmpty()
  source: string;

  @ApiProperty({ required: true })
  @Transform(({ value }) => decodeURI(value))
  @_IsString()
  @_IsNotEmpty()
  destination: string;

  @ApiProperty({ required: true })
  @_IsBoolean()
  @_IsNotEmpty()
  permanent: boolean;
}
