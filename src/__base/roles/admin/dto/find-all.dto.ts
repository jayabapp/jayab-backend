import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination-page.dto';
import { _IsInt, _IsString } from 'src/common/pipes/validator-translate.pipe';

export class FindAllBaseAdminDto extends PaginationDto {
  @ApiProperty({ required: false, example: 1 })
  @Type(() => Number)
  @_IsInt()
  @IsOptional()
  user_id: number;

  // @ApiProperty({ required: false, example: '' })
  // @_IsString()
  // @IsOptional()
  // mobile_number: string;
}
