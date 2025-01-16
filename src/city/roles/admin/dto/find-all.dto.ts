import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination-page.dto';
import { _IsIn, _IsString } from 'src/common/pipes/validator-translate.pipe';

export class FindAllCityAdminDto extends PaginationDto {
  @ApiProperty({ required: false, default: {} })
  @_IsString()
  @IsOptional()
  title: string;

  @ApiProperty({ required: false, default: {} })
  @Type(() => Number)
  @_IsIn([0, 1])
  @IsOptional()
  is_parent: number;
}
