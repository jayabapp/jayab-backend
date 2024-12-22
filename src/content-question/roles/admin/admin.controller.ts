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
import { ADMIN_ROUTE_GROUP } from 'src/content-question/common/route-group.constant';
import { ContentQuestionAdminService } from './admin.service';
import { CreateContentQuestionAdminDto } from './dto/create.dto';
import { SuccessResponseArgs } from 'src/common/interceptors/transform.interceptor';
import { UpdateContentQuestionAdminDto } from './dto/update.dto';
import { FindAllContentQuestionAdminDto } from './dto/find-all.dto';
import qs from 'qs';
import { ShowProps } from 'src/common/interfaces/model-props.interface';
import { AccessControlList } from '@prisma/client';
import { RequestType } from 'src/common/interfaces/user.interface';
import { filterValidator } from 'src/content-question/common/helpers/filter-validator.helper';

@ApiTags('👨‍💻 ContentQuestion - ADMIN')
@UseGuards(AdminJwtGuard)
@ApiBearerAuth('admin-jwt')
@Controller(ADMIN_ROUTE_GROUP)
export class ContentQuestionAdminController {
  constructor(private readonly contentQuestionAdminService: ContentQuestionAdminService) {}

  /* --------------------------------- CREATE --------------------------------- */
  @ApiOperation({ operationId: 'Create', description: '' })
  @Post()
  async create(
    @Req() req: RequestType,
    @Body() dto: CreateContentQuestionAdminDto,
  ): Promise<SuccessResponseArgs> {
    const admin = req.user;
    const result = await this.contentQuestionAdminService.create(dto, admin?.id);

    return { result, messageCode: 'CREATE' };
  }

  /* -------------------------------- FIND ALL -------------------------------- */
  @ApiOperation({ operationId: 'Find All', description: '' })
  @Get()
  async findAll(@Req() req, @Query() dto: FindAllContentQuestionAdminDto): Promise<SuccessResponseArgs> {
    const filterQuery = filterValidator(dto);
    if (!filterQuery) throw new BadRequestException('FILTER1');

    const result = await this.contentQuestionAdminService.findAll(filterQuery, dto.page, dto.per_page);

    return { result };
  }

  /* ------------------------------- MODEL PROPS ------------------------------ */
  @ApiOperation({ operationId: 'Find model props', description: '' })
  @Get('model-props')
  async findModelProps(@Req() req): Promise<SuccessResponseArgs> {
    const rbac = req.adminRbac as AccessControlList;

    const result = await this.contentQuestionAdminService.findModelProps(rbac);

    return { result };
  }

  /* -------------------------------- FIND ONE -------------------------------- */
  @ApiOperation({ operationId: 'Find One', description: '' })
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<SuccessResponseArgs> {
    const result = await this.contentQuestionAdminService.findOne(id);

    return { result };
  }

  /* --------------------------------- UPDATE --------------------------------- */
  @ApiOperation({ operationId: 'Update', description: '' })
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateContentQuestionAdminDto,
  ): Promise<SuccessResponseArgs> {
    await this.contentQuestionAdminService.findById(id);
    const result = await this.contentQuestionAdminService.update(id, dto);

    return { result, messageCode: 'UPDATE' };
  }

  /* --------------------------------- REMOVE --------------------------------- */
  @ApiOperation({ operationId: 'Remove', description: '' })
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<SuccessResponseArgs> {
    await this.contentQuestionAdminService.findById(id);
    await this.contentQuestionAdminService.remove(id);

    return { messageCode: 'DELETE' };
  }
}
