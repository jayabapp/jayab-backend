import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination-page.dto';

export class FindAllCityAdminDto extends PaginationDto {
  @ApiProperty({ required: false, default: {} })
  @IsOptional()
  filters: any;
}
