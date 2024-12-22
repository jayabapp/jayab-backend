import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsAlpha } from 'class-validator';
import { _IsNotEmpty, _IsString, _Length } from 'src/common/pipes/validator-translate.pipe';

export class CreateAccessControlModuleDto {
  @ApiProperty({ title: 'نام', required: true })
  @_Length(2, 64)
  @_IsString()
  @Transform(({ value }) => value.trim())
  @_IsNotEmpty()
  name: string;

  @ApiProperty({ title: 'کلید', required: true })
  @_Length(2, 64)
  @_IsString()
  @Transform(({ value }) => value.trim())
  @IsAlpha()
  @_IsNotEmpty()
  key: string;
}
