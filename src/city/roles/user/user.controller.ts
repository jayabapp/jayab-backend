import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CITY_USER_ROUTE_GROUP } from 'src/city/common/route-group.constant';
import { SuccessResponseArgs } from 'src/common/interceptors/transform.interceptor';
import { CitySharedService } from '../../shared.service';

@ApiTags('Cities - USER')
@Controller(CITY_USER_ROUTE_GROUP)
export class CityUserController {
  constructor(private readonly citySharedService: CitySharedService) {}

  @ApiOperation({ operationId: 'Find parents', description: '' })
  @Get()
  async findParents(): Promise<SuccessResponseArgs> {
    const result = await this.citySharedService.findParents();

    return { result };
  }

  @ApiOperation({ operationId: 'Find children', description: '' })
  @Get(':parentId')
  async findChildren(@Param('parentId', ParseIntPipe) parentId: number): Promise<SuccessResponseArgs> {
    const result = await this.citySharedService.findChildren(parentId);
    return { result };
  }

  @ApiOperation({ operationId: 'Find Cities', description: '' })
  @Get('provinces/cities')
  async findCities(): Promise<SuccessResponseArgs> {
    const result = await this.citySharedService.findCities();
    return { result };
  }
}
