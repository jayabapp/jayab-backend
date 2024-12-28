import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination-page.dto';
import { _IsBoolean, _IsEnum, _IsInt, _IsString } from 'src/common/pipes/validator-translate.pipe';

export class FindAllUserAdminDto extends PaginationDto {
  @ApiProperty({ required: false, default: '' })
  @_IsString()
  @IsOptional()
  full_name: string;

  @ApiProperty({ required: false, default: '0912' })
  @_IsString()
  @IsOptional()
  mobile_number: string;
}
