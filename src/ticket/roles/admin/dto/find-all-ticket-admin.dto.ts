import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination-page.dto';

export class FindAllTicketAdminDto extends PaginationDto {
  @ApiProperty({ required: false, default: {} })
  @IsOptional()
  filters: Object;
}
