import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination-page.dto';
import { _IsBoolean, _IsEnum, _IsInt, _IsString } from 'src/common/pipes/validator-translate.pipe';

export class FindAllUserAdminDto extends PaginationDto {
  @ApiProperty({ required: false, example: '' })
  @_IsString()
  @IsOptional()
  full_name: string;

  @ApiProperty({ required: false, example: '0912' })
  @_IsString()
  @IsOptional()
  mobile_number: string;

  @ApiProperty({ required: false, example: 'true' })
  @Transform(({ value }) => value === 'true' || value === true)
  @_IsBoolean()
  @IsOptional()
  is_banned: boolean;

  @ApiProperty({ required: false, example: 'true' })
  @Transform(({ value }) => value === 'true' || value === true)
  @_IsBoolean()
  @IsOptional()
  contact_click_limit_exceeded_at: boolean;
}
