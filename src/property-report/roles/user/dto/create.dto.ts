import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { _IsNotEmpty, _IsString, _Length } from 'src/common/pipes/validator-translate.pipe';
import { LOREM_IPSUM_TITLE } from 'src/common/utils/constants/faker.constant';

export class CreatePropertyReportUserDto {
  @ApiProperty({ required: true, example: LOREM_IPSUM_TITLE })
  @_Length(1, 128)
  @_IsString()
  @_IsNotEmpty()
  title: string;

  @ApiProperty({ required: false, example: LOREM_IPSUM_TITLE })
  @_Length(0, 1024)
  @_IsString()
  @IsOptional()
  description: string;
}
