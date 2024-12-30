import {
  Body,
  Controller,
  // Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserJwtGuard } from 'src/auth/guards/jwt/user-jwt.guard';
import { OWNER_ROUTE_GROUP } from 'src/property/common/route-group.constant';
import { SuccessResponseArgs } from 'src/common/interceptors/transform.interceptor';
import { OwnerGuard } from 'src/auth/guards/owner.guard';
import { PropertyOwnerService } from './owner.service';
import { RequestType } from 'src/common/interfaces/user.interface';
import { UpdatePropertyLocationOwnerDto, UpdatePropertyStepOneOwnerDto } from './dto/update-property.dto';
import {
  OwnerUpdatePropertyInterceptor,
  PropertyInterceptorData,
} from 'src/property/interceptors/owner-property.interceptor';

@ApiTags('Property - OWNER')
@UseGuards(UserJwtGuard, OwnerGuard)
@ApiBearerAuth('user-jwt')
@Controller(OWNER_ROUTE_GROUP)
export class PropertyOwnerController {
  constructor(private readonly propertyOwnerService: PropertyOwnerService) {}

  @ApiOperation({ operationId: 'Get last init prop', description: '' })
  @Get()
  async getLastInit(@Req() req: RequestType): Promise<SuccessResponseArgs> {
    const user = req.user;
    const result = await this.propertyOwnerService.findLastInitProp(user.owner_id);
    return { result };
  }

  @ApiOperation({ operationId: 'Create', description: '' })
  @UseInterceptors(OwnerUpdatePropertyInterceptor)
  @Post(':propertyId')
  async create(
    @Req() req: RequestType,
    @Param('propertyId', ParseIntPipe) propertyId: number,
    @Body() dto: UpdatePropertyStepOneOwnerDto,
  ): Promise<SuccessResponseArgs> {
    const property = req.interceptor_data as PropertyInterceptorData;
    const result = await this.propertyOwnerService.updateInit(property, dto);
    return { result, messageCode: 'CREATE' };
  }

  @ApiOperation({ operationId: 'Update property: location' })
  @UseInterceptors(OwnerUpdatePropertyInterceptor)
  @Patch(':propertyId/location')
  async updateLocation(
    @Param('propertyId', ParseIntPipe) propertyId: number,
    @Body() dto: UpdatePropertyLocationOwnerDto,
  ) {
    const result = await this.propertyOwnerService.updateLocation(propertyId, dto);
    return { result, messageCode: 'CREATE' };
  }
}
