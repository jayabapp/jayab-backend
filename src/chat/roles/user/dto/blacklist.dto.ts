import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, Validate } from 'class-validator';
import { _IsIn, _IsNotEmpty } from 'src/common/pipes/validator-translate.pipe';
import { IsIdNumber } from 'src/common/validators/is-id-number.validator';

export class BlockParticipantUserDto {
  @ApiProperty({ required: true, default: 1 })
  @Validate(IsIdNumber)
  @_IsNotEmpty()
  target_participant_id: number;

  @ApiProperty({ required: true, default: '' })
  @Type(() => Number)
  @_IsIn([0, 1])
  @_IsNotEmpty()
  action: number;
}
