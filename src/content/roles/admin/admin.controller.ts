import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AdminJwtGuard } from 'src/auth/guards/jwt/admin-jwt.guard';
import { ADMIN_ROUTE_GROUP } from 'src/content/common/route-group.constant';
import { ContentAdminService } from './admin.service';
import { CreateContentAdminDto } from './dto/create.dto';
import { SuccessResponseArgs } from 'src/common/interceptors/transform.interceptor';
import { UpdateContentAdminDto, UpdateContentProductCategoryAdminDto } from './dto/update.dto';
import { FindAllContentAdminDto } from './dto/find-all.dto';
import qs from 'qs';
import { ShowProps } from 'src/common/interfaces/model-props.interface';
import { AccessControlList, Prisma } from '@prisma/client';
import { ContentQuestionAdminService } from 'src/content-question/roles/admin/admin.service';
import { filterValidator } from 'src/content/common/helpers/filter-validator.helper';

@ApiTags('👨‍💻 Content - ADMIN')
@UseGuards(AdminJwtGuard)
@ApiBearerAuth('admin-jwt')
@Controller(ADMIN_ROUTE_GROUP)
export class ContentAdminController {
  constructor(private readonly contentAdminService: ContentAdminService) {}

  /* --------------------------------- CREATE --------------------------------- */
  @ApiOperation({ summary: 'Create', description: '' })
  @Post()
  async create(@Body() dto: CreateContentAdminDto): Promise<SuccessResponseArgs> {
    const result = await this.contentAdminService.create(dto);
    return { result, messageCode: 'CREATE' };
  }

  /* -------------------------------- FIND ALL -------------------------------- */
  @ApiOperation({ summary: 'Find All', description: '' })
  @Get()
  async findAll(@Req() req, @Query() dto: FindAllContentAdminDto): Promise<SuccessResponseArgs> {
    const filterQuery = filterValidator(dto);
    if (!filterQuery) throw new BadRequestException('FILTER1');

    const result = await this.contentAdminService.findAll(filterQuery, dto.page, dto.per_page);

    return { result };
  }

  /* ------------------------------- MODEL PROPS ------------------------------ */
  @ApiOperation({ summary: 'Find model props', description: '' })
  @Get('model-props')
  async findModelProps(@Req() req): Promise<SuccessResponseArgs> {
    const rbac = req.adminRbac as AccessControlList;

    const result = await this.contentAdminService.findModelProps(rbac);

    return { result };
  }

  /* -------------------------------- FIND ONE -------------------------------- */
  @ApiOperation({ summary: 'Find One', description: '' })
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<SuccessResponseArgs> {
    const result = await this.contentAdminService.findOne(id);

    return { result };
  }

  /* --------------------------------- UPDATE --------------------------------- */
  @ApiOperation({ summary: 'Update', description: '' })
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateContentAdminDto,
  ): Promise<SuccessResponseArgs> {
    await this.contentAdminService.findById(id);
    const result = await this.contentAdminService.update(id, dto);

    return { result, messageCode: 'UPDATE' };
  }

  /* --------------------------------- DELETE --------------------------------- */
  @ApiOperation({ summary: 'Remove', description: '' })
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<SuccessResponseArgs> {
    await this.contentAdminService.findById(id);
    await this.contentAdminService.remove(id);

    return { messageCode: 'DELETE' };
  }
}
