import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, Validate } from 'class-validator';
import { _IsIn, _IsNotEmpty } from 'src/common/pipes/validator-translate.pipe';
import { IsExist } from 'src/common/validators/is-exists.validator';
import { IsIdNumber } from 'src/common/validators/is-id-number.validator';

export class BlockParticipantUserDto {
  @ApiProperty({ required: true, example: 1 })
  @Validate(IsIdNumber)
  @Validate(IsExist, ['user', 'id'])
  @_IsNotEmpty()
  target_user_id: number;

  @ApiProperty({ required: true, example: 1 })
  @Type(() => Number)
  @_IsIn([0, 1])
  @_IsNotEmpty()
  action: number;
}
