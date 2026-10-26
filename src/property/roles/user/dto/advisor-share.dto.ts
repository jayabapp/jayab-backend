import { _IsString, _IsNotEmpty } from 'src/common/pipes/validator-translate.pipe';
import { ApiProperty } from '@nestjs/swagger';

export class GenerateAdvisorShareDto {
  @ApiProperty({ required: true })
  @_IsString()
  @_IsNotEmpty()
  elements: string;
}

export class FindAdvisorShareDto {
  @ApiProperty({ required: true })
  @_IsString()
  @_IsNotEmpty()
  content: string;
}
