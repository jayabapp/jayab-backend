import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CITY_USER_ROUTE_GROUP } from 'src/city/common/route-group.constant';
import { SuccessResponseArgs } from 'src/common/interceptors/transform.interceptor';
import { CitySharedService } from '../../shared.service';

@ApiTags('Cities - USER')
@Controller(CITY_USER_ROUTE_GROUP)
export class CityUserController {
  constructor(private readonly citySharedService: CitySharedService) {}

  @ApiOperation({ operationId: 'Find parents' })
  @Get()
  async findParents(): Promise<SuccessResponseArgs> {
    const result = await this.citySharedService.findParents();

    return { result };
  }

  @ApiOperation({ operationId: 'Search' })
  @Get('search')
  async findAll(@Query('q') q: string): Promise<SuccessResponseArgs> {
    const result = await this.citySharedService.findAll(q);
    return { result };
  }

  @ApiOperation({ operationId: 'Find children' })
  @Get(':parentId')
  async findChildren(@Param('parentId', ParseIntPipe) parentId: number): Promise<SuccessResponseArgs> {
    const result = await this.citySharedService.findChildren(parentId);
    return { result };
  }
}
