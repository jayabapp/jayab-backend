import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserJwtGuard } from 'src/auth/guards/jwt/user-jwt.guard';
import { CITY_USER_ROUTE_GROUP } from 'src/city/common/route-group.constant';
import { CitySharedService } from 'src/city/shared.service';
import { SuccessResponseArgs } from 'src/common/interceptors/transform.interceptor';

@ApiTags('Cities - USER')
@ApiBearerAuth('user-jwt')
@UseGuards(UserJwtGuard)
@Controller(CITY_USER_ROUTE_GROUP)
export class CityUserController {
  private readonly citySharedService: CitySharedService;

  @Get()
  async findParent(): Promise<SuccessResponseArgs> {
    const result = await this.citySharedService.findParent();
    return { result };
  }

  @Get(':parentId')
  async findChilds(@Param('parentId', ParseIntPipe) parentId: number): Promise<SuccessResponseArgs> {
    const result = await this.citySharedService.findChilds(parentId);
    return { result };
  }
}
