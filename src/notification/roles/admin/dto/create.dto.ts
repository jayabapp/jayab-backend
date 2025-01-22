import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import {
  _IsInt,
  _IsNotEmpty,
  _IsString,
  _IsNumber,
  _IsBoolean,
  _Min,
  _Max,
  _IsEnum,
  _Length,
} from 'src/common/pipes/validator-translate.pipe';
import { Type } from 'class-transformer';
import { FirebaseTopicType } from 'src/firebase/constants/topic-types';
import { NotificationType } from 'src/notification/common/notification-type.type';

export class CreateNotificationAdminDto {
  @ApiProperty({ required: true, default: '' })
  @_IsEnum(NotificationType)
  @Type(() => Number)
  @_IsNotEmpty()
  type: NotificationType;

  @ApiProperty({ required: false, default: '' })
  // @_Max(4096)
  // @_Min(1)
  @_IsString()
  @IsOptional()
  mobile_numbers: string;

  @ApiProperty({ required: false, default: '' })
  @_IsEnum(FirebaseTopicType)
  @IsOptional()
  topic: FirebaseTopicType;

  @ApiProperty({ required: true, default: 1 })
  @_Length(1, 128)
  @_IsString()
  @_IsNotEmpty()
  title: string;

  @ApiProperty({ required: true, default: 1 })
  @_Length(1, 2048)
  @_IsString()
  @_IsNotEmpty()
  body: string;
}
