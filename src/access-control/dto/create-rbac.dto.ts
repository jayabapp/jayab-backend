import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, Validate, ValidateNested } from 'class-validator';
import { _IsBoolean, _IsInt, _IsNotEmpty } from 'src/common/pipes/validator-translate.pipe';
import { IsExist } from 'src/common/validators/is-exists.validator';

export class RBACDto {
  @ApiProperty({ title: 'module id', required: true })
  @Type(() => Number)
  @_IsInt()
  @Validate(IsExist, ['accessControlModule', 'id'])
  @_IsNotEmpty()
  module_id: number;

  @ApiProperty({ title: 'create', required: true })
  @_IsBoolean()
  @_IsNotEmpty()
  c: boolean;

  @ApiProperty({ title: 'read', required: true })
  @_IsBoolean()
  @_IsNotEmpty()
  r: boolean;

  @ApiProperty({ title: 'update', required: true })
  @_IsBoolean()
  @_IsNotEmpty()
  u: boolean;

  @ApiProperty({ title: 'delete', required: true })
  @_IsBoolean()
  @_IsNotEmpty()
  d: boolean;

  @ApiProperty({ title: 'view', required: true })
  @_IsBoolean()
  @_IsNotEmpty()
  v: boolean;
}

export class CreateAccessControlListDto {
  @ApiProperty({ title: 'role id', required: true })
  @_IsInt()
  @Type(() => Number)
  @Validate(IsExist, ['accessControlRole', 'id'])
  @_IsNotEmpty()
  role_id: number;

  @ApiProperty({ type: () => RBACDto, isArray: true, title: 'lists', required: true })
  @Type(() => RBACDto)
  @IsArray()
  @ValidateNested({ each: true })
  @_IsNotEmpty()
  list: RBACDto[];
}
