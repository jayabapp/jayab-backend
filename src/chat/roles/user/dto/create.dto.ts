import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, Validate } from 'class-validator';
import { _IsNotEmpty } from 'src/common/pipes/validator-translate.pipe';
import { IsIdNumber } from 'src/common/validators/is-id-number.validator';

export class CreateChatUserDto {
  @ApiProperty({ required: false, example: 1 })
  @Validate(IsIdNumber)
  @_IsNotEmpty()
  property_id: number;
}
