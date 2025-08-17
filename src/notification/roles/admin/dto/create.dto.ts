import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, ValidateIf } from 'class-validator';
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
  @ApiProperty({ required: true, example: '' })
  @_IsEnum(NotificationType)
  @Type(() => Number)
  @_IsNotEmpty()
  type: NotificationType;

  @ApiProperty({ required: false, example: '' })
  @ValidateIf((obj) => obj.type === NotificationType.MOBILE)
  @_IsString()
  @_IsNotEmpty()
  mobile_numbers: string;

  @ApiProperty({ required: false, example: '' })
  @ValidateIf((obj) => obj.type === NotificationType.GROUP)
  @_IsEnum(FirebaseTopicType)
  @_IsNotEmpty()
  topic: FirebaseTopicType;

  @ApiProperty({ required: true, example: 'عنوان' })
  @_Length(1, 128)
  @_IsString()
  @_IsNotEmpty()
  title: string;

  @ApiProperty({ required: true, example: 'متن' })
  @_Length(1, 2048)
  @_IsString()
  @_IsNotEmpty()
  body: string;
}
