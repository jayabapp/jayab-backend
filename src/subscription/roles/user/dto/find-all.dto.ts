import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { PaginationCursorDto } from 'src/common/dto/pagination-cursor.dto';
import { _IsDate } from 'src/common/pipes/validator-translate.pipe';

export class FindAllSubscriptionUserDto extends PaginationCursorDto {
  @ApiProperty({ required: false, example: new Date() })
  @_IsDate()
  @Type(() => Date)
  @IsOptional()
  from: Date;

  @ApiProperty({ required: false, example: new Date() })
  @_IsDate()
  @Type(() => Date)
  @IsOptional()
  to: Date;
}
