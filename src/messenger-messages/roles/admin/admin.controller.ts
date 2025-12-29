import {
  BadRequestException,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AccessControlList } from '@prisma/client';
import { AdminJwtGuard } from 'src/auth/guards/jwt/admin-jwt.guard';
import { SuccessResponseArgs } from 'src/common/interceptors/transform.interceptor';
import { filterValidator } from 'src/messenger-messages/common/helpers/filter-validator.helper';
import { ADMIN_ROUTE_GROUP } from 'src/messenger-messages/common/route-group.constant';
import { MessengerMessagesAdminService } from './admin.service';
import { FindAllMessengerMessagesAdminDto } from './dto/find-all.dto';

@ApiTags('👨‍💻 MessengerMessages - ADMIN')
@UseGuards(AdminJwtGuard)
@ApiBearerAuth('admin-jwt')
@Controller(ADMIN_ROUTE_GROUP)
export class MessengerMessagesAdminController {
  constructor(private readonly messengerMessagesAdminService: MessengerMessagesAdminService) {}

  /* -------------------------------------------------------------------------- */
  /*                                 MODEL PROPS                                */
  /* -------------------------------------------------------------------------- */
  @ApiOperation({ summary: 'Find model props', description: '' })
  @Get('model-props')
  async findModelProps(@Req() req): Promise<SuccessResponseArgs> {
    const rbac = req.adminRbac as AccessControlList;
    const result = await this.messengerMessagesAdminService.findModelProps(rbac);
    return { result };
  }

  /* -------------------------------------------------------------------------- */
  /*                                    EXCEL                                   */
  /* -------------------------------------------------------------------------- */
  @ApiOperation({ summary: 'Get Excel', description: '' })
  @Get('excel')
  async getExcel(@Query() dto: FindAllMessengerMessagesAdminDto): Promise<SuccessResponseArgs> {
    const filterQuery = filterValidator(dto);
    if (!filterQuery) throw new BadRequestException('FILTER1');

    const list = await this.messengerMessagesAdminService.findAll(
      filterQuery,
      dto.page,
      dto.per_page,
      dto.skip,
    );

    const url = await this.messengerMessagesAdminService.createExcel(list.data);

    return { result: url };
  }

  /* -------------------------------------------------------------------------- */
  /*                                    FETCH                                   */
  /* -------------------------------------------------------------------------- */
  @ApiOperation({ summary: 'Find All', description: '' })
  @Get()
  async findAll(@Query() dto: FindAllMessengerMessagesAdminDto): Promise<SuccessResponseArgs> {
    const filterQuery = filterValidator(dto);
    if (!filterQuery) throw new BadRequestException('FILTER1');
    const result = await this.messengerMessagesAdminService.findAll(filterQuery, dto.page, dto.per_page);
    return { result };
  }

  @ApiOperation({ summary: 'Find One', description: '' })
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<SuccessResponseArgs> {
    const result = await this.messengerMessagesAdminService.findOne(id);

    return { result };
  }
}
