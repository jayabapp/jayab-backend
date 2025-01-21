import { Injectable, NotFoundException } from '@nestjs/common';
import { AccessControlList, User, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
// import { CreateUserAdminDto } from './dto/create.dto';
import { UpdateUserAdminDto } from './dto/update.dto';
import {
  CreateProps,
  OperatorItems,
  ShowAction,
  ShowProps,
  TableProps,
} from 'src/common/interfaces/model-props.interface';
import { operators, operatorsList } from 'src/common/utils/constants/filter-operators.constant';
import { PaginatedResult, paginate } from 'src/common/helpers/paginator';
import {
  allActionsBuilder,
  createPropsBuilder,
  filterPropsBuilder,
  showPropsBuilder,
  tablePropsBuilder,
} from 'src/user/common/helpers/model-props-builder.helper';
import { SearchUsersAdminDto } from './dto/search.dto';
import { DateType } from 'src/common/validators/is-date.validator';
import { UpdatePartialUserAdminDto } from './dto/update-partial.dto';
import { UserStatusList } from 'src/user/common/user-status.type';
import { ExcelCol, saveToExcel, SHEET_NAME } from 'src/common/helpers/excel-creator.helper';
import moment from 'moment-jalaali';
import { JALAALI_FORMAT } from 'src/common/utils/constants/date.constant';

@Injectable()
export class UserAdminService {
  constructor(private readonly db: PrismaService) {}

  /* -------------------------------------------------------------------------- */
  /*                                   CREATE                                   */
  /* -------------------------------------------------------------------------- */
  // /**
  //  * create
  //  * @param dto
  //  * @returns
  //  */
  // async create(dto: CreateUserAdminDto): Promise<User> {
  //   const newUser = await this.db.user.create({ data: dto });
  //   return newUser;
  // }

  /* -------------------------------------------------------------------------- */
  /*                                    FETCH                                   */
  /* -------------------------------------------------------------------------- */
  /**
   * find all User
   * @param filers
   * @param page
   * @param perPage
   * @returns
   */
  async findAll(
    filters: object,
    page: number,
    perPage = 50,
    isExcel?: false,
  ): Promise<PaginatedResult<User>> {
    const list = await paginate()<User, Prisma.UserFindManyArgs>(
      this.db.user,
      { where: filters },
      { page, perPage },
    );

    return list;
  }

  /**
   * find one user
   * this method is used in the findOne controller to include or select items
   * @param id
   * @returns
   */
  async findOne(id: number): Promise<{ showProps: Partial<ShowProps>[]; actions: Array<ShowAction> }> {
    const item = await this.db.user.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('NOT_FOUND');

    const { showProps, actions } = showPropsBuilder(item);

    return { showProps, actions };
  }

  /**
   * find by id
   * @param id
   * @returns
   */
  async findById(id: number): Promise<User> {
    const item = await this.db.user.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('NOT_FOUND');

    return item;
  }

  /**
   * Find user by national_code
   *
   * @param {SearchUsersAdminDto} searchUsersAdminDto
   * @returns
   */
  async search(dto: SearchUsersAdminDto): Promise<User[]> {
    const result = await this.db.user.findMany({
      where: {
        mobile_number: { contains: dto.q },
      },
    });

    return result;
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
  async update(id: number, dto: UpdateUserAdminDto): Promise<User> {
    const item = await this.db.user.update({
      where: { id },
      data: dto,
    });

    return item;
  }

  /**
   * Update editable columns in admin panel table
   * @param id
   * @param dto
   * @returns
   */
  async updatePartial(id: number, dto: UpdatePartialUserAdminDto): Promise<void> {
    console.log('dto', dto);

    const item = await this.db.user.update({ where: { id }, data: dto });
  }

  /* -------------------------------------------------------------------------- */
  /*                                   DELETE                                   */
  /* -------------------------------------------------------------------------- */
  // /**
  //  * remove
  //  * @param id
  //  */
  // async remove(id: number): Promise<void> {
  //   await this.db.user.delete({ where: { id } });
  // }

  /* -------------------------------------------------------------------------- */
  /*                                    EXCEL                                   */
  /* -------------------------------------------------------------------------- */
  async createExcel(list: PaginatedResult<User>): Promise<any> {
    const newList = list.data.map((e) => ({
      ...e,
      is_advisor: e.advisor_id ? 'بله' : 'خیر',
      is_owner: e.owner_id ? 'بله' : 'خیر',
      is_banned: e.is_banned ? 'بله' : 'خیر',
      created_at: moment(e.created_at).format(JALAALI_FORMAT),
    }));

    const excelCols: ExcelCol[] = [
      { header: 'شماره موبایل', key: 'mobile_number', width: 15 },
      { header: 'مشاور است', key: 'is_advisor', width: 15 },
      { header: 'مالک است', key: 'is_owner', width: 15 },
      { header: 'بلاک شده', key: 'is_banned', width: 15 },
      { header: 'تاریخ ثبت نام', key: 'created_at', width: 15 },
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
