import { Injectable, NotFoundException } from '@nestjs/common';
import { AccessControlList, SubmittedForm, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateSubmittedFormAdminDto } from './dto/create.dto';
import { UpdateSubmittedFormAdminDto } from './dto/update.dto';
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
} from 'src/submitted-form/common/helpers/model-props-builder.helper';
import { UpdatePartialSubmittedFormAdminDto } from './dto/update-partial.dto';
import { FormStatuses } from 'src/submitted-form/common/form-status.interface';

@Injectable()
export class SubmittedFormAdminService {
  constructor(private readonly db: PrismaService) {}

  /* -------------------------------------------------------------------------- */
  /*                                   CREATE                                   */
  /* -------------------------------------------------------------------------- */
  /**
   * create
   * @param dto
   * @returns
   */
  async create(dto: CreateSubmittedFormAdminDto): Promise<SubmittedForm> {
    const newSubmittedForm = await this.db.submittedForm.create({ data: dto });
    return newSubmittedForm;
  }

  /* -------------------------------------------------------------------------- */
  /*                                    FETCH                                   */
  /* -------------------------------------------------------------------------- */
  /**
   * find all SubmittedForm
   * @param filers
   * @param page
   * @param perPage
   * @returns
   */
  async findAll(
    filters: Prisma.SubmittedFormWhereInput,
    page: number,
    perPage = 50,
  ): Promise<PaginatedResult<SubmittedForm>> {
    const list = await paginate()<SubmittedForm, Prisma.SubmittedFormFindManyArgs>(
      this.db.submittedForm,
      { where: filters, include: { content: { select: { id: true, title: true } } } },
      { page, perPage },
    );

    return list;
  }

  /**
   * find one submittedForm
   * this method is used in the findOne controller to include or select items
   * @param id
   * @returns
   */
  async findOne(id: number): Promise<{ showProps: ShowProps[]; actions?: ShowAction[] }> {
    const item = await this.db.submittedForm.findUnique({
      where: { id },
      include: { submitted_form_items: { include: { images: true } }, content: true },
    });
    if (!item) throw new NotFoundException('NOT_FOUND');

    await this.db.submittedForm.update({ where: { id }, data: { status: FormStatuses.REVIEWED } });

    const showProps = showPropsBuilder(item);
    const actions = showActionBuilder(item);

    return { showProps, actions };
  }

  /**
   * find by id
   * @param id
   * @returns
   */
  async findById(id: number): Promise<SubmittedForm> {
    const item = await this.db.submittedForm.findUnique({ where: { id } });
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
  async update(id: number, dto: UpdateSubmittedFormAdminDto): Promise<SubmittedForm> {
    const item = await this.db.submittedForm.update({
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
  async updatePartial(id: number, dto: UpdatePartialSubmittedFormAdminDto): Promise<SubmittedForm> {
    const item = await this.db.submittedForm.update({
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
    await this.db.submittedForm.delete({ where: { id } });
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
