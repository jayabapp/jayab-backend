import {
  BadRequestException,
  Body,
  Controller,
  // Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  // Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AdminJwtGuard } from 'src/auth/guards/jwt/admin-jwt.guard';
import { UserAdminService } from './admin.service';
// import { CreateUserAdminDto } from './dto/create.dto';
import { SuccessResponseArgs } from 'src/common/interceptors/transform.interceptor';
import { UpdateUserAdminDto } from './dto/update.dto';
import { FindAllUserAdminDto } from './dto/find-all.dto';
import qs from 'qs';
import { AccessControlList } from '@prisma/client';
import { filterValidator } from 'src/user/common/helpers/filter-validator.helper';
import { SearchUsersAdminDto } from './dto/search.dto';
import {
  ExcelCol,
  excelPaginationOptions,
  saveToExcel,
  SHEET_NAME,
} from 'src/common/helpers/excel-creator.helper';
import { ADMIN_ROUTE_GROUP } from 'src/user/common/route-group.constant';
import { UpdatePartialUserAdminDto } from './dto/update-partial.dto';

@ApiTags('👨‍💻 User - ADMIN')
@UseGuards(AdminJwtGuard)
@ApiBearerAuth('admin-jwt')
@Controller(ADMIN_ROUTE_GROUP)
export class UserAdminController {
  constructor(private readonly userAdminService: UserAdminService) {}

  /* -------------------------------------------------------------------------- */
  /*                                 MODEL PROPS                                */
  /* -------------------------------------------------------------------------- */
  @ApiOperation({ operationId: 'Find model props', description: '' })
  @Get('model-props')
  async findModelProps(@Req() req): Promise<SuccessResponseArgs> {
    const rbac = req.adminRbac as AccessControlList;
    const result = await this.userAdminService.findModelProps(rbac);
    return { result };
  }

  /* -------------------------------------------------------------------------- */
  /*                                   CREATE                                   */
  /* -------------------------------------------------------------------------- */
  // @ApiOperation({ operationId: 'Create', description: '' })
  // @Post()
  // async create(@Body() dto: CreateUserAdminDto): Promise<SuccessResponseArgs> {
  //   const result = await this.userAdminService.create(dto);

  //   return { result, messageCode: 'CREATE' };
  // }

  /* -------------------------------------------------------------------------- */
  /*                                    EXCEL                                   */
  /* -------------------------------------------------------------------------- */
  @ApiOperation({ operationId: 'Get Excel', description: '' })
  @Get('excel')
  async getExcel(@Query() dto: FindAllUserAdminDto): Promise<SuccessResponseArgs> {
    const filterQuery = filterValidator(dto);
    if (!filterQuery) throw new BadRequestException('FILTER1');

    const list = await this.userAdminService.findAll(
      filterQuery,
      excelPaginationOptions.page,
      excelPaginationOptions.perPage,
    );

    const url = await this.userAdminService.createExcel(list);

    return { result: url };
  }

  /* -------------------------------------------------------------------------- */
  /*                                    FETCH                                   */
  /* -------------------------------------------------------------------------- */
  @ApiOperation({ operationId: 'Search user' })
  @ApiQuery({ name: 'q' })
  @Get('search')
  async search(@Query() searchUsersAdminDto: SearchUsersAdminDto): Promise<SuccessResponseArgs> {
    const result = await this.userAdminService.search(searchUsersAdminDto);
    return { result };
  }

  @ApiOperation({ operationId: 'Find All', description: '' })
  @Get()
  async findAll(@Query() dto: FindAllUserAdminDto): Promise<SuccessResponseArgs> {
    const filterQuery = filterValidator(dto);
    if (!filterQuery) throw new BadRequestException('FILTER1');
    const result = await this.userAdminService.findAll(filterQuery, dto.page, dto.per_page);
    return { result };
  }

  @ApiOperation({ operationId: 'Find One', description: '' })
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<SuccessResponseArgs> {
    const result = await this.userAdminService.findOne(id);

    return { result };
  }

  /* -------------------------------------------------------------------------- */
  /*                                   UPDATE                                   */
  /* -------------------------------------------------------------------------- */
  @ApiOperation({ operationId: 'Update', description: '' })
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserAdminDto,
  ): Promise<SuccessResponseArgs> {
    await this.userAdminService.findById(id);
    const result = await this.userAdminService.update(id, dto);

    return { result, messageCode: 'UPDATE' };
  }

  /* -------------------------------------------------------------------------- */
  /*                               UPDATE PARTIAL                               */
  /* -------------------------------------------------------------------------- */
  // @ApiOperation({ operationId: 'Update Partial', description: '' })
  // @Patch(':id/update-partial')
  // async updatePartial(
  //   @Param('id', ParseIntPipe) id: number,
  //   @Body() dto: UpdatePartialUserAdminDto,
  // ): Promise<SuccessResponseArgs> {
  //   await this.userAdminService.findById(id);
  //   const result = await this.userAdminService.updatePartial(id, dto);

  //   return { result, messageCode: 'UPDATE' };
  // }

  /* -------------------------------------------------------------------------- */
  /*                                   DELETE                                   */
  /* -------------------------------------------------------------------------- */
  // @ApiOperation({ operationId: 'Remove', description: '' })
  // @Delete(':id')
  // async remove(@Param('id', ParseIntPipe) id: number): Promise<SuccessResponseArgs> {
  //   await this.userAdminService.findById(id);
  //   await this.userAdminService.remove(id);

  //   return { messageCode: 'DELETE' };
  // }
}
