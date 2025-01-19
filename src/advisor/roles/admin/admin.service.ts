import { Injectable, NotFoundException } from '@nestjs/common';
import { AccessControlList, Advisor, Prisma } from '@prisma/client';
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

@Injectable()
export class AdvisorAdminService {
  constructor(private readonly db: PrismaService) {}

  /* -------------------------------------------------------------------------- */
  /*                                   CREATE                                   */
  /* -------------------------------------------------------------------------- */
  /**
   * create
   * @param dto
   * @returns
   */
  async create(dto: CreateAdvisorAdminDto): Promise<Advisor> {
    const newAdvisor = await this.db.advisor.create({ data: dto });
    return newAdvisor;
  }

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
  ): Promise<PaginatedResult<Advisor>> {
    const list = await paginate()<Advisor, Prisma.AdvisorFindManyArgs>(
      this.db.advisor,
      { where: filters, include: { user: { include: { profile_image: true } } } },
      { page, perPage },
    );

    const result = list.data.map((e) => {
      return {
        ...e,
        has_sub: e?.subscription_expired_at,
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
    const item = await this.db.advisor.findUnique({
      where: { id },
      include: {
        document_image: true,
        national_card_image: true,
        user: { include: { profile_image: true } },
      },
    });
    if (!item) throw new NotFoundException('NOT_FOUND');

    const showProps = showPropsBuilder(item);
    const actions = showActionBuilder(item);

    return { showProps, actions };
  }

  /**
   * find by id
   * @param id
   * @returns
   */
  async findById(id: number): Promise<Advisor> {
    const item = await this.db.advisor.findUnique({ where: { id } });
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
  async update(admin: AdminType, id: number, dto: UpdatePartialAdvisorAdminDto): Promise<Advisor> {
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

  /**
   * Update editable columns in admin panel table
   * @param id
   * @param dto
   * @returns
   */
  async updatePartial(id: number, dto: UpdatePartialAdvisorAdminDto): Promise<Advisor> {
    const item = await this.db.advisor.update({
      where: { id },
      data: dto,
    });

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
