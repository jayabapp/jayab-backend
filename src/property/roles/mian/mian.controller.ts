import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SuccessResponseArgs } from 'src/common/interceptors/transform.interceptor';
import { MIAN_ROUTE_GROUP } from 'src/property/common/route-group.constant';
import { WebhookActionDto } from './dto/webhook.dto';
import { FindAllPropertyMianDto } from './dto/find-all.dto';
import { PropertyMianService } from './mian.service';
import { MianJwtGuard } from 'src/auth/guards/jwt/mian-jwt.guard';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@ApiTags('Property - MIAN')
@UseGuards(MianJwtGuard)
@ApiBearerAuth('mian-jwt')
@Controller(MIAN_ROUTE_GROUP)
export class PropertyMianController {
  constructor(private readonly propertyMianService: PropertyMianService) {}

  @ApiOperation({ summary: 'Find Host Properties', description: '' })
  @Post('')
  async findHostProperties(@Body() dto: FindAllPropertyMianDto): Promise<SuccessResponseArgs> {
    const result = await this.propertyMianService.findHostProperties(dto);
    return { result };
  }

  @ApiOperation({ summary: 'Webhooks actions', description: '' })
  @Post('webhooks/actions')
  async callBack(@Body() dto: WebhookActionDto): Promise<SuccessResponseArgs> {
    const prop = await this.propertyMianService.findOnePropById(dto.property_id);
    if (!prop) return;

    dto.action == 'block'
      ? await this.propertyMianService.block(dto)
      : await this.propertyMianService.unBlock(dto);

    return;
  }
}
