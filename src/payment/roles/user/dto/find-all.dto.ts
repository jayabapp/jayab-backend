import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { PaginationCursorDto } from 'src/common/dto/pagination-cursor.dto';

export class FindAllPaymentUserDto extends PaginationCursorDto {
  @ApiProperty({ required: false, default: {} })
  @IsOptional()
  filters: Object;
}
