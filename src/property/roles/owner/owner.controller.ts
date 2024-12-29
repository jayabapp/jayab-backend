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
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserJwtGuard } from 'src/auth/guards/jwt/user-jwt.guard';
import { OWNER_ROUTE_GROUP } from 'src/property/common/route-group.constant';
import { SuccessResponseArgs } from 'src/common/interceptors/transform.interceptor';
import { OwnerGuard } from 'src/auth/guards/owner.guard';
import { PropertyOwnerService } from './owner.service';
import { RequestType } from 'src/common/interfaces/user.interface';

@ApiTags('Property - OWNER')
@UseGuards(UserJwtGuard, OwnerGuard)
@ApiBearerAuth('user-jwt')
@Controller(OWNER_ROUTE_GROUP)
export class PropertyOwnerController {
  constructor(private readonly propertyOwnerService: PropertyOwnerService) {}

  @ApiOperation({ operationId: 'Create', description: '' })
  @Post()
  async create(@Req() req: RequestType): Promise<SuccessResponseArgs> {
    const user = req.user;
    const result = await this.propertyOwnerService.create(user.owner_id);
    return { result, messageCode: 'CREATE' };
  }

  // @ApiOperation({ operationId: 'Create', description: '' })
  // @Post()
  // async updateInit(
  //   @Req() req: RequestType,
  //   @Body() dto: CreatePropertyOwnerDto,
  // ): Promise<SuccessResponseArgs> {
  //   const user = req.user;
  //   const result = await this.propertyOwnerService.updateInit(user.owner_id, dto);
  //   return { result, messageCode: 'CREATE' };
  // }
}
