import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, ValidateIf } from 'class-validator';
import { PaginationCursorDto } from 'src/common/dto/pagination-cursor.dto';
import {
  _IsInt,
  _Max,
  _Min,
  _IsBoolean,
  _IsArray,
  _IsString,
  _IsNotEmpty,
  _IsNumberString,
  _IsIn,
} from 'src/common/pipes/validator-translate.pipe';
import { RentType } from 'src/property/common/types/property-rent-types.type';

export class GenerateAdvisorShareDto {
  @ApiProperty({ required: true })
  @_IsString()
  @_IsNotEmpty()
  elements: string;
}

export class FindAdvisorShareDto {
  @ApiProperty({ required: true })
  @_IsString()
  @_IsNotEmpty()
  content: string;
}
