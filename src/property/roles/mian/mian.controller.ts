import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SuccessResponseArgs } from 'src/common/interceptors/transform.interceptor';
import { MIAN_ROUTE_GROUP } from 'src/property/common/route-group.constant';
import { CallbackMianDto } from './dto/callback.dto';
import { FindAllPropertyMianDto } from './dto/find-all.dto';
import { PropertyMianService } from './mian.service';

@ApiTags('Property - MIAN')
// @UseGuards(MianJwtGuard)
// @ApiBearerAuth('mian-jwt')
@Controller(MIAN_ROUTE_GROUP)
export class PropertyMianController {
  constructor(private readonly propertyMianService: PropertyMianService) {}

  @ApiOperation({ summary: 'Find Host Properties', description: '' })
  @Post('hosts/properties')
  async findHostProperties(@Body() dto: FindAllPropertyMianDto): Promise<SuccessResponseArgs> {
    const result = await this.propertyMianService.findHostProperties(dto);
    return { result };
  }

  @ApiOperation({ summary: 'Callback (block, unblock)', description: '' })
  @Post('hosts/properties/callback')
  async callBack(@Body() dto: CallbackMianDto): Promise<SuccessResponseArgs> {
    await this.propertyMianService.findOnePropById(dto.property_id);

    dto.source == 'block'
      ? await this.propertyMianService.block(dto)
      : await this.propertyMianService.unBlock(dto);

    return;
  }
}
