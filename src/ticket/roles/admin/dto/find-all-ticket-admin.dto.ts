import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination-page.dto';
import { _IsEnum, _IsNumberString } from 'src/common/pipes/validator-translate.pipe';
import { TicketCommonStatuses } from 'src/ticket/common/ticket-status.constant';

export class FindAllTicketAdminDto extends PaginationDto {
  @ApiProperty({ required: false, example: '09121234567' })
  @_IsNumberString()
  @IsOptional()
  user_mobile_number?: string;

  @ApiProperty({ required: false, example: TicketCommonStatuses.CLOSED })
  @_IsEnum(TicketCommonStatuses)
  @Type(() => Number)
  @IsOptional()
  status: TicketCommonStatuses;
}
