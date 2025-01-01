import { ApiProperty } from '@nestjs/swagger';
import { _IsInt, _IsNotEmpty } from 'src/common/pipes/validator-translate.pipe';

export class CanChatDto {
  @ApiProperty({ title: 'ای دی درخواست اجاره' })
  @_IsNotEmpty()
  @_IsInt()
  owner_rent_request_id: number;
}
