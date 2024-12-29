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
import { USER_ROUTE_GROUP } from 'src/property/common/route-group.constant';
// import { PropertyUserService } from './user.service';
// import { CreatePropertyOwnerDto } from './dto/create.dto';
import { SuccessResponseArgs } from 'src/common/interceptors/transform.interceptor';
// import { UpdatePropertyUserDto } from './dto/update.dto';
// import { FindAllPropertyUserDto } from './dto/find-all.dto';
import { OwnerGuard } from 'src/auth/guards/owner.guard';
import { PropertyOwnerService } from './owner.service';
import { CreatePropertyOwnerDto } from '../dto/create.dto';
import { RequestType } from 'src/common/interfaces/user.interface';

@ApiTags('Property - USER')
@UseGuards(UserJwtGuard)
@UseGuards(OwnerGuard)
@ApiBearerAuth('user-jwt')
@Controller(USER_ROUTE_GROUP)
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
