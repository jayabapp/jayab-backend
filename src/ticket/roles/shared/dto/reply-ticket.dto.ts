import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { _IsNotEmpty, _IsString, _MaxLength, _MinLength } from 'src/common/pipes/validator-translate.pipe';

export class ReplyTicketDto {
  @ApiProperty({ default: 'پیام', required: true })
  @_MaxLength(5000)
  @_MinLength(3)
  @_IsString()
  @_IsNotEmpty()
  @Transform(({ value }) => value.trim())
  message: string;
}
