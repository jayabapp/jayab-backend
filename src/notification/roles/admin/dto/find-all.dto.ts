import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination-page.dto';
import { _IsEnum, _IsString } from 'src/common/pipes/validator-translate.pipe';
import { NotificationSourceFilter } from 'src/notification/common/notification-source.type';

export class FindAllNotificationAdminDto {}

export class FindAllSentNotificationAdminDto extends PaginationDto {
  @ApiProperty({ required: false, example: '09121234567' })
  @_IsString()
  @IsOptional()
  mobile_number: string;

  @ApiProperty({ required: false, enum: NotificationSourceFilter })
  @_IsEnum(NotificationSourceFilter)
  @IsOptional()
  source: NotificationSourceFilter;
}
