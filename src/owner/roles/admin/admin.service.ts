import { Injectable, NotFoundException } from '@nestjs/common';
import { AccessControlList, Owner, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateOwnerAdminDto } from './dto/create.dto';
import { UpdateOwnerAdminDto } from './dto/update.dto';
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
} from 'src/owner/common/helpers/model-props-builder.helper';
import { UpdatePartialOwnerAdminDto } from './dto/update-partial.dto';
import { AdminType } from 'src/common/interfaces/user.interface';
import { AdminDescription } from 'src/common/interfaces/admin-description.type';
import { OwnerStatusList } from 'src/owner/common/owner-status.type';

@Injectable()
export class OwnerAdminService {
  constructor(private readonly db: PrismaService) {}

  /* -------------------------------------------------------------------------- */
  /*                                   CREATE                                   */
  /* -------------------------------------------------------------------------- */
  /**
   * create
   * @param dto
   * @returns
   */
  async create(dto: CreateOwnerAdminDto): Promise<Owner> {
    const newOwner = await this.db.owner.create({ data: dto });
    return newOwner;
  }

  /* -------------------------------------------------------------------------- */
  /*                                    FETCH                                   */
  /* -------------------------------------------------------------------------- */
  /**
   * find all Owner
   * @param filers
   * @param page
   * @param perPage
   * @returns
   */
  async findAll(
    filters: Prisma.OwnerWhereInput,
    page: number,
    perPage = 50,
  ): Promise<PaginatedResult<Owner>> {
    const list = await paginate()<Owner, Prisma.OwnerFindManyArgs>(
      this.db.owner,
      { where: filters, include: { user: { include: { profile_image: true } } } },
      { page, perPage },
    );

    return list;
  }

  /**
   * find one owner
   * this method is used in the findOne controller to include or select items
   * @param id
   * @returns
   */
  async findOne(id: number): Promise<{ showProps: ShowProps[]; actions?: ShowAction[] }> {
    const item = await this.db.owner.findUnique({
      where: { id },
      include: { user: { include: { profile_image: true } } },
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
  async findById(id: number): Promise<Owner> {
    const item = await this.db.owner.findUnique({ where: { id } });
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
  async update(admin: AdminType, id: number, dto: UpdatePartialOwnerAdminDto): Promise<Owner> {
    let updateData: Prisma.OwnerUpdateInput = { status: dto.status };
    const adminDscr: AdminDescription = {
      description: dto.admin_description || '',
      status: OwnerStatusList.find((e) => e.id === dto.status)?.title,
      admin_name: admin.full_name,
      admin_id: admin.id,
      admin_role: admin.role.name,
      created_at: new Date(),
    };
    updateData = { ...updateData, admin_descriptions: { push: adminDscr } };

    const item = await this.db.owner.update({ where: { id }, data: updateData });
    return item;
  }

  /**
   * Update editable columns in admin panel table
   * @param id
   * @param dto
   * @returns
   */
  async updatePartial(id: number, dto: UpdatePartialOwnerAdminDto): Promise<Owner> {
    const item = await this.db.owner.update({
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
    await this.db.owner.delete({ where: { id } });
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
