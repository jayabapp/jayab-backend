import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination-page.dto';
import { _IsInt, _IsString } from 'src/common/pipes/validator-translate.pipe';

export class FindAllSubscriptionPlanAdminDto extends PaginationDto {
  @ApiProperty({ required: false, example: 1 })
  @IsOptional()
  group: string;

  // @ApiProperty({ required: false, example: '' })
  // @_IsString()
  // @IsOptional()
  // mobile_number: string;
}
