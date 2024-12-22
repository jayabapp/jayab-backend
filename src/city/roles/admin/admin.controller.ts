import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SuccessResponseArgs } from 'src/common/interceptors/transform.interceptor';
import { AdminJwtGuard } from 'src/auth/guards/jwt/admin-jwt.guard';
import { CityAdminService } from './admin.service';
import { CreateCityDto } from 'src/city/dto/create-city.dto';
import { CitySharedService } from 'src/city/shared.service';
import { CITY_ADMIN_ROUTE_GROUP } from 'src/city/common/route-group.constant';

@ApiTags('👨‍💻 Cities - ADMIN')
@ApiBearerAuth('admin-jwt')
@UseGuards(AdminJwtGuard)
@Controller(CITY_ADMIN_ROUTE_GROUP)
export class CityAdminController {
  constructor(
    private readonly cityAdminService: CityAdminService,
    private readonly citySharedService: CitySharedService,
  ) {}

  @Post()
  async create(@Body() dto: CreateCityDto): Promise<SuccessResponseArgs> {
    const result = await this.cityAdminService.create(dto);
    return { result, messageCode: 'CREATE' };
  }

  @Get()
  async findAll(): Promise<SuccessResponseArgs> {
    const result = await this.cityAdminService.findAll();
    return { result };
  }

  @Get('provinces')
  async findParents(): Promise<SuccessResponseArgs> {
    const result = await this.citySharedService.findParent();
    return { result };
  }

  @Get('provinces/:id')
  async findChilds(@Param('id', ParseIntPipe) id: number): Promise<SuccessResponseArgs> {
    const result = await this.citySharedService.findChilds(id);
    return { result };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<SuccessResponseArgs> {
    const result = await this.cityAdminService.findOne(id);
    return { result };
  }

  @Put(':id')
  async updateOne(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateCityDto,
  ): Promise<SuccessResponseArgs> {
    const result = await this.cityAdminService.updateOne(id, dto);
    return { result, messageCode: 'UPDATE' };
  }

  @Delete(':id')
  async removeOne(@Param('id', ParseIntPipe) id: number): Promise<SuccessResponseArgs> {
    const result = await this.cityAdminService.removeOne(id);
    return { result, messageCode: 'DELETE' };
  }
}
