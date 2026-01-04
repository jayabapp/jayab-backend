import { Body, Controller, Param, ParseIntPipe, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserJwtGuard } from 'src/auth/guards/jwt/user-jwt.guard';
import { SuccessResponseArgs } from 'src/common/interceptors/transform.interceptor';
import { RequestType } from 'src/common/interfaces/user.interface';
import { USER_ROUTE_GROUP } from 'src/property-report/common/route-group.constant';
import { CreatePropertyReportUserDto } from './dto/create.dto';
import { PropertyReportUserService } from './user.service';

@ApiTags('PropertyReport - USER')
@UseGuards(UserJwtGuard)
@ApiBearerAuth('user-jwt')
@Controller(USER_ROUTE_GROUP)
export class PropertyReportUserController {
  constructor(private readonly propertyReportUserService: PropertyReportUserService) {}

  @ApiOperation({ summary: 'Create', description: '' })
  @Post(':propertyId')
  async create(
    @Req() request: RequestType,
    @Param('propertyId', ParseIntPipe) propertyId: number,
    @Body() dto: CreatePropertyReportUserDto,
  ): Promise<SuccessResponseArgs> {
    const user = request.user;

    const result = await this.propertyReportUserService.create(user.id, propertyId, dto);

    return { result, messageCode: 'CREATE' };
  }
}
