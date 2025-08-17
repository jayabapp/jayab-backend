import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { _IsInt, _IsNotEmpty, _IsString } from 'src/common/pipes/validator-translate.pipe';

export class UpdateRoleNotifPermissionDto {
  @ApiProperty({ required: true, example: 1 })
  @_IsInt()
  @_IsNotEmpty()
  role_id: number;

  @ApiProperty({ required: true, example: '-NewUser-NewTicket' })
  @_IsString()
  @IsOptional()
  permissions: string;
}
