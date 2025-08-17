import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, Validate } from 'class-validator';
import { _IsString, _Length, _MaxLength } from 'src/common/pipes/validator-translate.pipe';
import { IsIdNumber } from 'src/common/validators/is-id-number.validator';

export class SendMessageDto {
  @ApiProperty({ required: false, example: 'test text' })
  @_MaxLength(2048)
  @_IsString()
  @IsOptional()
  text: string;

  @ApiProperty({ required: false, example: 1 })
  @Validate(IsIdNumber)
  @IsOptional()
  media_id: number;
}
