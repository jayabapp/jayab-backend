import { Injectable, NotFoundException } from '@nestjs/common';
import { AccessControlList, Property, Prisma, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateProps,
  OperatorItems,
  ShowAction,
  ShowProps,
  TableProps,
} from 'src/common/interfaces/model-props.interface';
import { operatorsList } from 'src/common/utils/constants/filter-operators.constant';
import { type PaginatedResult, paginate } from 'src/common/helpers/paginator';
import {
  allActionsBuilder,
  createPropsBuilder,
  filterPropsBuilder,
  showActionBuilder,
  showPropsBuilder,
  tablePropsBuilder,
} from 'src/property/common/helpers/model-props-builder.helper';
import { UpdatePartialPropertyAdminDto } from './dto/update-partial.dto';
import { startOfDate, startOfToday } from 'src/common/helpers/date.helper';
import moment from 'moment-jalaali';
import { DayHelper } from 'src/common/helpers/day.helper';
import {
  PropertyArrayResType,
  PropertyJsonType,
  PropertySerializer,
} from 'src/property/serializer/property.serializer';
import { PropertyStatuses, PropertyStatusesList } from 'src/property/common/types/property-status.type';
import { AdminDescription } from 'src/common/interfaces/admin-description.type';
import { AdminType } from 'src/common/interfaces/user.interface';
import { ExcelCol, saveToExcel, SHEET_NAME } from 'src/common/helpers/excel-creator.helper';
import { JALAALI_FORMAT } from 'src/common/utils/constants/date.constant';
import { UpdatePropertyImagesAdminDto } from './dto/update.dto';
import TokenPayload from 'src/auth/common/interface/token-payload.interface';
import { UserRole } from 'src/common/interfaces/role.enum';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class PropertyAdminService {
  constructor(
    private readonly db: PrismaService,
    private readonly dayHelper: DayHelper,
    private readonly propertySerializer: PropertySerializer,
    private readonly configService: ConfigService,
    private jwtService: JwtService,
  ) {}

  /* -------------------------------------------------------------------------- */
  /*                                    FETCH                                   */
  /* -------------------------------------------------------------------------- */
  /**
   * find all Property
   * @param filers
   * @param page
   * @param perPage
   * @returns
   */
  async findAll(
    filters: Prisma.PropertyWhereInput,
    page: number,
    perPage = 50,
  ): Promise<PaginatedResult<PropertyArrayResType>> {
    const calendarDateQuery: Prisma.PropertyCalendarWhereInput = {
      date: { gte: startOfToday(), lt: startOfDate(moment().add(8, 'days').toDate()) },
    };

    const list = await paginate()<PropertyJsonType, Prisma.PropertyFindManyArgs>(
      this.db.property,
      {
        where: filters,
        include: {
          owner: { include: { user: true } },
          feature_image: true,
          province: { select: { title: true } },
          city: { select: { title: true } },
          property_options: true,
          daily_price: true,
          calendar: { where: calendarDateQuery, orderBy: { date: 'asc' } },
          bedrooms: { select: { total_bedrooms: true } },
          _count: { select: { attachments: true } },
          favorites: true,
        },
      },
      { page, perPage },
    );

    const today = await this.dayHelper.today();
    const serialized = await this.propertySerializer.toArray(list.data, today, true, true);

    return { data: serialized, meta: list.meta };
  }

  /**
   * find one property
   * this method is used in the findOne controller to include or select items
   * @param id
   * @returns
   */
  async findOne(
    id: number,
  ): Promise<{ showProps: ShowProps[]; actions?: ShowAction[]; item: PropertyJsonType }> {
    const calendarDateQuery: Prisma.PropertyCalendarWhereInput = {
      date: { gte: startOfToday(), lt: startOfDate(moment().add(8, 'days').toDate()) },
    };

    const item = await this.db.property.findUnique({
      where: { id },
      include: {
        owner: { include: { user: true } },
        feature_image: true,
        attachments: true,
        temp_attachments: true,
        province: { select: { title: true } },
        city: { select: { title: true } },
        property_options: { select: { option: { select: { title: true, group: true } } } },
        bedrooms: true,
        daily_price: true,
        calendar: { where: calendarDateQuery, orderBy: { date: 'asc' } },
        // assistants: true,
        description: true,
        favorites: true,
      },
    });
    if (!item) throw new NotFoundException('NOT_FOUND');

    const today = await this.dayHelper.today();
    const serialized = await this.propertySerializer.toJSON(item, today, false, true); //اطلاعاتی که ادمین میبینه با مالک یکسانه

    const showProps = showPropsBuilder(serialized);
    const actions = showActionBuilder(item);

    return { showProps, actions, item };
  }

  /**
   * find by id
   * @param id
   * @returns
   */

  async findById(id: number): Promise<
    Prisma.PropertyGetPayload<{
      include: { owner: { include: { user: { select: { mobile_number: true } } } } };
    }>
  > {
    const item = await this.db.property.findUnique({
      where: { id },
      include: { owner: { include: { user: { select: { mobile_number: true } } } } },
    });
    if (!item) throw new NotFoundException('NOT_FOUND');

    return item;
  }

  /* -------------------------------------------------------------------------- */
  /*                                 ADMIN SSO                                  */
  /* -------------------------------------------------------------------------- */

  /**
   * generate token to admin login to owner profile
   * @param propertyId
   * @returns
   */
  async generateSSOToken(propertyId: number): Promise<any> {
    const property = await this.db.property.findFirst({
      where: { id: propertyId },
      select: { owner: { select: { user: true } } },
    });
    if (!property) throw new NotFoundException('NOT_FOUND');

    const user = property.owner.user;
    const payload: TokenPayload = {
      id: user.id,
      jwtLevel: user.jwt_level || 1,
      role: UserRole.USER,
    };

    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('auth.secret'),
      expiresIn: '30m',
    });

    return token;
  }

  /**
   * Update Property status
   * @param id
   * @param dto
   * @returns
   */
  async updateStatus(
    admin: AdminType,
    id: number,
    dto: UpdatePartialPropertyAdminDto,
    property: Property,
  ): Promise<void> {
    let updateData: Prisma.PropertyUpdateInput = { status: dto.status };
    const adminDscr: AdminDescription = {
      description: dto.admin_description || '',
      status: PropertyStatusesList.find((e) => e.id === dto.status)?.title,
      admin_name: admin.full_name,
      admin_id: admin.id,
      admin_role: admin.role.name,
      created_at: new Date(),
    };
    updateData = { ...updateData, admin_descriptions: { push: adminDscr } };
    /**
     * اپدیت سورت ملک بعد از تایید آگهی در دفعه اول
     */
    if (dto.status === PropertyStatuses.PUBLISHED) updateData = { ...updateData, sort_order: Date.now() };

    await this.db.property.update({ where: { id }, data: updateData });
  }

  /**
   * update property images
   * @param id
   * @param dto
   */
  async updateImages(id: number, dto: UpdatePropertyImagesAdminDto): Promise<void> {
    let updateData: Prisma.PropertyUpdateInput = {
      attachments: { set: [], connect: dto.images?.map((e) => ({ id: +e })) },
      temp_attachments: { set: [], connect: dto.temp_images?.map((e) => ({ id: +e })) },
      feature_image: { connect: { id: +dto.feature_image_id } },
    };

    await this.db.property.update({ where: { id }, data: updateData });
  }

  /* -------------------------------------------------------------------------- */
  /*                                    EXCEL                                   */
  /* -------------------------------------------------------------------------- */
  async createExcel(list: PropertyArrayResType[]): Promise<any> {
    const newList = list.map((e) => ({
      ...e,
      is_authorized: e.is_authorized ? 'بله' : 'خیر',
      has_blue_tick: e.has_blue_tick ? 'بله' : 'خیر',
      has_pool: e.has_pool ? 'بله' : 'خیر',
      slug: e.slug,
      std_capacity: e.std_capacity,
      mobile_number: e?.owner?.mobile_number,
      full_name: e?.owner?.full_name,
      remaining_days: e.remaining_days,
      status: e.status.title,
      created_at: moment(e.created_at).format(JALAALI_FORMAT),
    }));

    const excelCols: ExcelCol[] = [
      { header: 'نام مالک', key: 'full_name', width: 15 },
      { header: 'شماره موبایل مالک', key: 'mobile_number', width: 20 },
      { header: 'عنوان', key: 'title', width: 15 },
      { header: 'کد', key: 'code', width: 15 },
      { header: 'اسلاگ', key: 'slug', width: 25 },
      { header: 'شهر', key: 'province', width: 15 },
      { header: 'استان', key: 'city', width: 15 },
      { header: 'وضعیت', key: 'status', width: 20 },
      { header: 'تاریخ ثبت ملک', key: 'created_at', width: 15 },
      { header: 'روز باقیمانده از اشتراک', key: 'remaining_days', width: 20 },
      { header: 'ظرفیت استاندارد', key: 'std_capacity', width: 20 },
      { header: 'احراز شده', key: 'is_authorized', width: 15 },
      { header: 'تیک آبی دارد', key: 'has_blue_tick', width: 15 },
      { header: 'استخر دارد', key: 'has_pool', width: 15 },
      { header: 'تعداد خواب', key: 'total_bedrooms', width: 15 },
      { header: 'کمیسیون مشاور', key: 'advisor_commission', width: 15 },
      { header: 'تعداد لایک', key: 'favorite_count', width: 15 },
    ];

    const url = await saveToExcel(excelCols, newList, SHEET_NAME.USERS);
    return url;
  }

  /* -------------------------------------------------------------------------- */
  /*                                   HELPER                                   */
  /* -------------------------------------------------------------------------- */
  /**
   * find model props
   * @param rbac
   * @returns
   */
  async findModelProps(rbac: AccessControlList): Promise<{
    filterProps: Array<CreateProps>;
    createProps: Array<CreateProps>;
    tableProps: TableProps;
    operators: Array<OperatorItems>;
  }> {
    // ACTIONS
    const availableActions = allActionsBuilder(rbac);

    // PROPS
    const filterProps = filterPropsBuilder();
    const tableProps = tablePropsBuilder(availableActions);
    const createProps = createPropsBuilder();

    return { operators: operatorsList, filterProps, createProps, tableProps };
  }
}
