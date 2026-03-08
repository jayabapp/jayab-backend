import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AccessControlList } from '@prisma/client';
import { AdminJwtGuard } from 'src/auth/guards/jwt/admin-jwt.guard';
import { SuccessResponseArgs } from 'src/common/interceptors/transform.interceptor';
import { AdminRequestType } from 'src/common/interfaces/user.interface';
import { filterValidator } from 'src/property/common/helpers/filter-validator.helper';
import { ADMIN_ROUTE_GROUP } from 'src/property/common/route-group.constant';
import { PropertyStatusesList } from 'src/property/common/types/property-status.type';
import { SmsService } from 'src/sms/sms.service';
import { PropertyAdminMigrationService } from './admin-migration.service';
import { PropertyAdminService } from './admin.service';
import { FindAllPropertyAdminDto } from './dto/find-all.dto';
import { UpdatePartialPropertyAdminDto } from './dto/update-partial.dto';
import { UpdatePropertyImagesAdminDto } from './dto/update.dto';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@ApiTags('👨‍💻 Property - ADMIN')
@UseGuards(AdminJwtGuard)
@ApiBearerAuth('admin-jwt')
@Controller(ADMIN_ROUTE_GROUP)
export class PropertyAdminController {
  constructor(
    private readonly propertyAdminService: PropertyAdminService,
    private readonly propertyAdminMigrationService: PropertyAdminMigrationService,
    private readonly smsService: SmsService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /* -------------------------------------------------------------------------- */
  /*                                 MODEL PROPS                                */
  /* -------------------------------------------------------------------------- */
  @ApiOperation({ summary: 'Find model props', description: '' })
  @Get('model-props')
  async findModelProps(@Req() req): Promise<SuccessResponseArgs> {
    const rbac = req.adminRbac as AccessControlList;
    const result = await this.propertyAdminService.findModelProps(rbac);
    return { result };
  }

  /* -------------------------------------------------------------------------- */
  /*                                    FETCH                                   */
  /* -------------------------------------------------------------------------- */
  /* -------------------------------------------------------------------------- */
  /*                                    EXCEL                                   */
  /* -------------------------------------------------------------------------- */
  @ApiOperation({ summary: 'Get Excel', description: '' })
  @Get('excel')
  async getExcel(@Query() dto: FindAllPropertyAdminDto): Promise<SuccessResponseArgs> {
    const filterQuery = filterValidator(dto);
    if (!filterQuery) throw new BadRequestException('FILTER1');

    const list = await this.propertyAdminService.findAll(filterQuery, dto.page, dto.per_page, dto.skip);

    const url = await this.propertyAdminService.createExcel(list.data);

    return { result: url };
  }

  @ApiOperation({ summary: 'Find All', description: '' })
  @Get()
  async findAll(@Query() dto: FindAllPropertyAdminDto): Promise<SuccessResponseArgs> {
    const filterQuery = filterValidator(dto);
    if (!filterQuery) throw new BadRequestException('FILTER1');

    const result = await this.propertyAdminService.findAll(filterQuery, dto.page, dto.per_page);

    return { result };
  }

  @ApiOperation({ summary: 'Find One', description: '' })
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<SuccessResponseArgs> {
    const result = await this.propertyAdminService.findOne(id);

    return { result };
  }

  /* -------------------------------------------------------------------------- */
  /*                               UPDATE PARTIAL                               */
  /* -------------------------------------------------------------------------- */
  @ApiOperation({ summary: 'Update Status', description: '' })
  @Patch(':id')
  async updateStatus(
    @Req() req: AdminRequestType,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePartialPropertyAdminDto,
  ): Promise<SuccessResponseArgs> {
    const admin = req.user;
    const property = await this.propertyAdminService.findById(id);
    const result = await this.propertyAdminService.updateStatus(admin, id, dto, property);

    //send sms to owner
    const statusText = PropertyStatusesList.find((e) => e.id === dto.status)?.title;
    await this.smsService.sendChangePropertyStatusToOwner(
      property.owner.user.mobile_number,
      property.title,
      statusText,
    );

    return { result, messageCode: 'UPDATE' };
  }

  @ApiOperation({ summary: 'Update Images', description: '' })
  @Put(':id/images')
  async updateImages(
    @Req() req: AdminRequestType,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePropertyImagesAdminDto,
  ): Promise<SuccessResponseArgs> {
    const admin = req.user;
    const property = await this.propertyAdminService.findById(id);
    const result = await this.propertyAdminService.updateImages(id, dto);

    return { result, messageCode: 'UPDATE' };
  }

  @ApiOperation({ summary: 'Owner SSO', description: '' })
  @Get(':id/sso')
  async generateSSOToken(
    @Req() req: AdminRequestType,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<SuccessResponseArgs> {
    const result = await this.propertyAdminService.generateSSOToken(id);

    return { result };
  }

  /* ----------------------------- MIAN API TOKEN ----------------------------- */
  @ApiOperation({ summary: 'Generate "Mian" API Token', description: '' })
  @Get('mian/token')
  async generateToken(): Promise<SuccessResponseArgs> {
    const token = this.jwtService.sign(
      {},
      {
        secret: this.configService.get('mianAuth.secret'),
      },
    );
    return { result: { token } };
  }

  /* -------------------------------------------------------------------------- */
  /*                                  MIGRATION                                 */
  /* -------------------------------------------------------------------------- */

  /*
  @ApiOperation({ summary: 'Migrate Users', description: '' })
  @Post('migrate/users')
  async migrate(): Promise<SuccessResponseArgs> {
    await this.propertyAdminMigrationService.migrateFromV1Users();

    return {};
  }

  @ApiOperation({ summary: 'Migrate Owners', description: '' })
  @Post('migrate/owners')
  async migrateOwners(): Promise<SuccessResponseArgs> {
    await this.propertyAdminMigrationService.migrateFromV1Owners();

    return {};
  }

  @ApiOperation({ summary: 'Migrate Attachments', description: '' })
  @Post('migrate/attachments')
  async migrateAttachments(): Promise<SuccessResponseArgs> {
    return;
    await this.propertyAdminMigrationService.migrateFromV1Attachments();

    return {};
  }

  @ApiOperation({ summary: 'Convert to webp', description: '' })
  @Post('migrate/convertToWebp')
  async convertToWebp(): Promise<SuccessResponseArgs> {
    return;
    await this.propertyAdminMigrationService.convertToWebp();

    return {};
  }
  @ApiOperation({ summary: 'Upload Attachments', description: '' })
  @Post('migrate/upload')
  async uploadAttachments(): Promise<SuccessResponseArgs> {
    return;
    await this.propertyAdminMigrationService.uploadAttachments();

    return {};
  }

  @ApiOperation({ summary: 'Migrate options', description: '' })
  @Post('migrate/options')
  async migrateOptions(): Promise<SuccessResponseArgs> {
    // await this.propertyAdminMigrationService.migrateFromV1Options();
    await this.propertyAdminMigrationService.migrateFromV1Cities();

    return {};
  }

  @ApiOperation({ summary: 'Migrate Property', description: '' })
  @Post('migrate/properties')
  async migrateProperties(): Promise<SuccessResponseArgs> {
    await this.propertyAdminMigrationService.migrateFromV1Properties();

    return {};
  }
    */
}

// curl -X POST "https://api.jayab.app/api/v1/mian/properties" \
// -H "authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NzI5NzcyNTF9.41QXu5soYHcSpQ-8I0eo1RP6Ixtex2qOb_fOZ9hlZdc" \
// -H "content-type: application/json" \
// -d '{"phone_number":"09113228155"}'
