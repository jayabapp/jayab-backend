import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateTestAccessMemberDto {
  @ApiProperty()
  @IsBoolean()
  is_active: boolean;
}
