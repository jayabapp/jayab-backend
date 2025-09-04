import { Injectable, NotFoundException } from '@nestjs/common';
import { AccessControlList, Advisor, City, Prisma, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAdvisorAdminDto } from './dto/create.dto';
import { UpdateAdvisorAdminDto } from './dto/update.dto';
import {
  CreateProps,
  FilterProps,
  OperatorItems,
  ShowAction,
  ShowProps,
  TableProps,
} from 'src/common/interfaces/model-props.interface';
import { operators, operatorsList } from 'src/common/utils/constants/filter-operators.constant';
import { type PaginatedResult, paginate } from 'src/common/helpers/paginator';
import {
  allActionsBuilder,
  createPropsBuilder,
  filterPropsBuilder,
  showActionBuilder,
  showPropsBuilder,
  tablePropsBuilder,
} from 'src/advisor/common/helpers/model-props-builder.helper';
import { UpdatePartialAdvisorAdminDto } from './dto/update-partial.dto';
import { AdminDescription } from 'src/common/interfaces/admin-description.type';
import { AdvisorStatusList } from 'src/advisor/common/advisor-status.type';
import { AdminType } from 'src/common/interfaces/user.interface';
import moment from 'moment-jalaali';
import { isEmpty } from 'lodash';
import { ExcelCol, saveToExcel, SHEET_NAME } from 'src/common/helpers/excel-creator.helper';
import { JALAALI_FORMAT } from 'src/common/utils/constants/date.constant';

@Injectable()
export class AdvisorAdminService {
  constructor(private readonly db: PrismaService) {}

  // /* -------------------------------------------------------------------------- */
  // /*                                   CREATE                                   */
  // /* -------------------------------------------------------------------------- */
  // /**
  //  * create
  //  * @param dto
  //  * @returns
  //  */
  // async create(dto: CreateAdvisorAdminDto): Promise<Advisor> {
  //   const newAdvisor = await this.db.advisor.create({ data: dto });
  //   return newAdvisor;
  // }

  /* -------------------------------------------------------------------------- */
  /*                                    FETCH                                   */
  /* -------------------------------------------------------------------------- */
  /**
   * find all Advisor
   * @param filers
   * @param page
   * @param perPage
   * @returns
   */
  async findAll(
    filters: Prisma.AdvisorWhereInput,
    page: number,
    perPage = 50,
  ): Promise<PaginatedResult<any>> {
    const list = await paginate()<Advisor, Prisma.AdvisorFindManyArgs>(
      this.db.advisor,
      { where: filters, include: { user: { include: { profile_image: true } } } },
      { page, perPage },
    );

    list.data = list.data.map((e) => {
      return {
        ...e,
        has_sub: moment(e?.subscription_expired_at).isAfter(moment()),
        sub_remaining_days: e?.subscription_expired_at
          ? moment(e?.subscription_expired_at).diff(moment(), 'days')
          : 0,
      };
    });

    return list;
  }

  /**
   * find one advisor
   * this method is used in the findOne controller to include or select items
   * @param id
   * @returns
   */
  async findOne(id: number): Promise<{ showProps: ShowProps[]; actions?: ShowAction[] }> {
    let item = await this.db.advisor.findUnique({
      where: { id },
      include: {
        document_image: true,
        national_card_image: true,
        cities: true,
        user: { include: { profile_image: true } },
      },
    });
    if (!item) throw new NotFoundException('NOT_FOUND');

    const showProps = showPropsBuilder({
      ...item,
      profile_image: item.user.profile_image,
      profile_image_id: item.user.profile_image_id,
    });
    const actions = showActionBuilder(item);

    return { showProps, actions };
  }

  /**
   * find by id
   * @param id
   * @returns
   */
  async findById(id: number): Promise<Advisor & { user: User; cities: City[] }> {
    const item = await this.db.advisor.findUnique({ where: { id }, include: { user: true, cities: true } });
    if (!item) throw new NotFoundException('NOT_FOUND');

    return item;
  }

  /* -------------------------------------------------------------------------- */
  /*                                   UPDATE                                   */
  /* -------------------------------------------------------------------------- */
  /**
   * update
   * @param id
   * @param dto
   * @returns
   */
  async update(advisor: Advisor & { user: User; cities: City[] }, dto: UpdateAdvisorAdminDto): Promise<void> {
    /*  */
    const fullName = dto.full_name; // چون نام برای کاربر است نه برای مشاور
    const profileImageId = dto.profile_image_id;
    delete dto.full_name;
    delete dto.profile_image_id;

    /*  */
    let data: Prisma.AdvisorUncheckedUpdateInput = dto;

    if (!isEmpty(dto.cityIds)) {
      const oldCityIds = advisor.cities.map((e) => ({ id: e.id }));
      const newCityIds = dto.cityIds.map((e) => ({ id: e }));
      delete dto.cityIds;
      data = { ...data, cities: { disconnect: oldCityIds, connect: newCityIds } };
    } else data = { ...data, cities: { set: [] } };

    //@ts-ignore
    delete data.cityIds;

    await this.db.$transaction(async (tx) => {
      await tx.advisor.update({ where: { id: advisor.id }, data });

      await tx.user.update({
        where: { id: advisor.user.id },
        data: {
          full_name: fullName,
          profile_image_id: profileImageId,
        },
      });
    });
  }

  /**
   * Update editable columns in admin panel table
   * @param id
   * @param dto
   * @returns
   */
  async updatePartial(admin: AdminType, id: number, dto: UpdatePartialAdvisorAdminDto): Promise<Advisor> {
    let updateData: Prisma.AdvisorUpdateInput = { status: dto.status };
    const adminDscr: AdminDescription = {
      description: dto.admin_description || '',
      status: AdvisorStatusList.find((e) => e.id === dto.status)?.title,
      admin_name: admin.full_name,
      admin_id: admin.id,
      admin_role: admin.role.name,
      created_at: new Date(),
    };
    updateData = { ...updateData, admin_descriptions: { push: adminDscr } };

    const item = await this.db.advisor.update({ where: { id }, data: updateData });

    return item;
  }

  /* -------------------------------------------------------------------------- */
  /*                                   DELETE                                   */
  /* -------------------------------------------------------------------------- */
  /**
   * remove
   * @param id
   */
  async remove(id: number): Promise<void> {
    await this.db.advisor.delete({ where: { id } });
  }

  /* -------------------------------------------------------------------------- */
  /*                                    EXCEL                                   */
  /* -------------------------------------------------------------------------- */
  async createExcel(
    list: PaginatedResult<Advisor & { user: User; has_sub: boolean; sub_remaining_days: number }>,
  ): Promise<any> {
    const newList = list.data.map((e) => ({
      ...e,
      full_name: e.user.full_name,
      mobile_number: e.user.mobile_number,
      users_satisfaction: e.users_satisfaction || 'بدون امتیاز',
      owners_satisfaction: e.owners_satisfaction || 'بدون امتیاز',
      is_special: e.is_special ? 'بله' : 'خیر',
      status: AdvisorStatusList.find((as) => as.id == e.status)?.title,
      has_sub: e.has_sub ? 'بله' : 'خیر',
      sub_remaining_days: e.sub_remaining_days,
      tel: e.tel,
      address: e.address,
      created_at: moment(e.created_at).format(JALAALI_FORMAT),
    }));

    const excelCols: ExcelCol[] = [
      { header: 'نام و نام خانوادگی', key: 'full_name', width: 25 },
      { header: 'موبایل', key: 'mobile_number', width: 15 },
      { header: 'شماره تلفن', key: 'tel', width: 15 },
      { header: 'رضایت کاربران', key: 'users_satisfaction', width: 15 },
      { header: 'رضایت مالکان', key: 'owners_satisfaction', width: 15 },
      { header: 'وضعیت', key: 'status', width: 20 },
      { header: 'ویژه', key: 'is_special', width: 15 },
      { header: 'اشتراک فعال', key: 'has_sub', width: 15 },
      { header: 'روز مانده از اشتراک', key: 'sub_remaining_days', width: 20 },
      { header: 'آدرس', key: 'address', width: 60 },
      { header: 'تاریخ ثبت نام', key: 'created_at', width: 15 },
    ];

    const url = await saveToExcel(excelCols, newList, SHEET_NAME.ADVISORS);
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
