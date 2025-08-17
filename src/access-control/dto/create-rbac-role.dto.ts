import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { _IsNotEmpty, _IsString, _Length } from 'src/common/pipes/validator-translate.pipe';

export class CreateAccessControlRoleDto {
  @ApiProperty({ title: 'نام', required: true, example: 'اپراتور' })
  @_Length(2, 64)
  @_IsString()
  @Transform(({ value }) => value.trim())
  @_IsNotEmpty()
  name: string;
}
