import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination-page.dto';
import { _IsInt, _IsString } from 'src/common/pipes/validator-translate.pipe';

export class FindAllLandingPageAdminDto extends PaginationDto {
  @ApiProperty({ required: false, example: 1 })
  @_IsString()
  @IsOptional()
  title?: string;

  // @ApiProperty({ required: false, example: '' })
  // @_IsString()
  // @IsOptional()
  // mobile_number: string;
}
