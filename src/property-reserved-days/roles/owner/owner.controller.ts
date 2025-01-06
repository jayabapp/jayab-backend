import {
  Body,
  Controller,
  // Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
// import { OwnerJwtGuard } from 'src/auth/guards/jwt/user-jwt.guard';
import { OWNER_ROUTE_GROUP } from 'src/property-reserved-days/common/route-group.constant';
import { PropertyReservedDaysOwnerService } from './owner.service';
import { CreatePropertyReservedDaysOwnerDto } from './dto/create.dto';
import { SuccessResponseArgs } from 'src/common/interceptors/transform.interceptor';
import { FindAllPropertyReservedDaysOwnerDto } from './dto/find-all.dto';
import { UserJwtGuard } from 'src/auth/guards/jwt/user-jwt.guard';
import { OwnerGuard } from 'src/auth/guards/owner.guard';
import { OwnerUpdatePropertyInterceptor } from 'src/property/common/interceptors/owner-property.interceptor';

@ApiTags('PropertyReservedDays - OWNER')
@UseGuards(UserJwtGuard, OwnerGuard)
@UseInterceptors(OwnerUpdatePropertyInterceptor)
@ApiBearerAuth('user-jwt')
@Controller(OWNER_ROUTE_GROUP) // property_id exists by default
export class PropertyReservedDaysOwnerController {
  constructor(private readonly propertyReservedDaysOwnerService: PropertyReservedDaysOwnerService) {}

  @ApiOperation({ operationId: 'Create', description: '' })
  @Post()
  async create(
    @Param('propertyId', ParseIntPipe) propertyId: number,
    @Body() dto: CreatePropertyReservedDaysOwnerDto,
  ): Promise<SuccessResponseArgs> {
    const result = await this.propertyReservedDaysOwnerService.create(propertyId, dto);

    return {};
  }
}
