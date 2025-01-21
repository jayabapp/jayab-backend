import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CITY_USER_ROUTE_GROUP } from 'src/city/common/route-group.constant';
import { SuccessResponseArgs } from 'src/common/interceptors/transform.interceptor';
import { CitySharedService } from '../../shared.service';
import { FindAllCityUserDto } from './dto/find-all.dto';

@ApiTags('Cities - USER')
@Controller(CITY_USER_ROUTE_GROUP)
export class CityUserController {
  constructor(private readonly citySharedService: CitySharedService) {}

  @ApiOperation({ operationId: 'Find All' })
  @Get()
  async findAll(@Query() dto: FindAllCityUserDto): Promise<SuccessResponseArgs> {
    const result = await this.citySharedService.findAll(dto);
    return { result };
  }

  @ApiOperation({ operationId: 'Find children' })
  @Get(':parentId')
  async findChildren(@Param('parentId', ParseIntPipe) parentId: number): Promise<SuccessResponseArgs> {
    const result = await this.citySharedService.findChildren(parentId);
    return { result };
  }
}
