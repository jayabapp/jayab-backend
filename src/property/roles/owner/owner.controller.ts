import {
  BadRequestException,
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
import {
  UpdatePropertyBedroomOwnerDto,
  UpdatePropertyEnvOwnerDto,
  UpdatePropertyFacilityOwnerDto,
  UpdatePropertyLocationOwnerDto,
  UpdatePropertyMediaOwnerDto,
  UpdatePropertyPriceOwnerDto,
  UpdatePropertyStepOneOwnerDto,
} from './dto/update-property.dto';
import { AttachmentService } from 'src/attachment/attachment.service';
import {
  OwnerUpdatePropertyInterceptor,
  PropertyInterceptorData,
} from 'src/property/common/interceptors/owner-property.interceptor';

@ApiTags('Property - OWNER')
@UseGuards(UserJwtGuard, OwnerGuard)
@ApiBearerAuth('user-jwt')
@Controller(OWNER_ROUTE_GROUP)
export class PropertyOwnerController {
  constructor(
    private readonly propertyOwnerService: PropertyOwnerService,
    private readonly attachmentService: AttachmentService,
  ) {}

  @ApiOperation({ operationId: 'Get last init prop', description: '' })
  @Get('init')
  async getLastInit(@Req() req: RequestType): Promise<SuccessResponseArgs> {
    const user = req.user;
    const result = await this.propertyOwnerService.findLastInitProp(user.owner_id);
    return { result };
  }

  @ApiOperation({ operationId: 'Create', description: '' })
  @UseInterceptors(OwnerUpdatePropertyInterceptor)
  @Put(':propertyId')
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

  @ApiOperation({ operationId: 'Update property: media' })
  @UseInterceptors(OwnerUpdatePropertyInterceptor)
  @Patch(':propertyId/media')
  async updateMedia(
    @Req() req: RequestType,
    @Param('propertyId', ParseIntPipe) propertyId: number,
    @Body() dto: UpdatePropertyMediaOwnerDto,
  ) {
    const user = req.user;

    // check images and video
    await this.attachmentService.validateFileOwner(dto.images, user.id, 1);
    if (!dto.images.includes(dto.feature_image_id)) throw new BadRequestException('PROPERTY_IMAGES1');
    // if (dto.video_id) await this.attachmentService.validateFileOwner([dto.video_id], user.id, 2);

    //
    const result = await this.propertyOwnerService.updateMedia(propertyId, dto);
    return { result, messageCode: 'CREATE' };
  }

  @ApiOperation({ operationId: 'Update property: environment' })
  @UseInterceptors(OwnerUpdatePropertyInterceptor)
  @Patch(':propertyId/environment')
  async updateEnvironment(
    @Param('propertyId', ParseIntPipe) propertyId: number,
    @Body() dto: UpdatePropertyEnvOwnerDto,
  ) {
    const result = await this.propertyOwnerService.updateEnvironment(propertyId, dto);
    return { result, messageCode: 'CREATE' };
  }

  @ApiOperation({ operationId: 'Update property: bedroom' })
  @UseInterceptors(OwnerUpdatePropertyInterceptor)
  @Patch(':propertyId/bedroom')
  async updateBedroom(
    @Param('propertyId', ParseIntPipe) propertyId: number,
    @Body() dto: UpdatePropertyBedroomOwnerDto,
  ) {
    const result = await this.propertyOwnerService.updateBedroom(propertyId, dto);
    return { result, messageCode: 'CREATE' };
  }

  @ApiOperation({ operationId: 'Update property: facility' })
  @UseInterceptors(OwnerUpdatePropertyInterceptor)
  @Patch(':propertyId/facility')
  updateFacility(
    @Param('propertyId', ParseIntPipe) propertyId: number,
    @Body() dto: UpdatePropertyFacilityOwnerDto,
  ) {
    const result = this.propertyOwnerService.updateFacility(propertyId, dto);
    return { result, messageCode: 'CREATE' };
  }

  @ApiOperation({ operationId: 'Update property: price' })
  @UseInterceptors(OwnerUpdatePropertyInterceptor)
  @Patch(':propertyId/price')
  updatePrices(
    @Param('propertyId', ParseIntPipe) propertyId: number,
    @Body() dto: UpdatePropertyPriceOwnerDto,
  ) {
    const result = this.propertyOwnerService.updatePrices(propertyId, dto);
    return { result, messageCode: 'CREATE' };
  }
}
