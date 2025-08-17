import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { _IsNotEmpty, _IsString, _MaxLength, _MinLength } from 'src/common/pipes/validator-translate.pipe';

export class CreateTicketDto {
  @ApiProperty({ required: true, example: 'عنوان' })
  @_MinLength(3)
  @_MaxLength(100)
  @Transform(({ value }) => value.trim())
  @_IsString()
  @_IsNotEmpty()
  title: string;

  @ApiProperty({ required: true, example: 'پیام' })
  @_MinLength(3)
  @_MaxLength(5000)
  @Transform(({ value }) => value.trim())
  @_IsString()
  @_IsNotEmpty()
  message: string;
}
