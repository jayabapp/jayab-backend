import { Injectable, NotFoundException } from '@nestjs/common';
import { AccessControlList, CallLog, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCallLogAdminDto } from './dto/create.dto';
import { UpdateCallLogAdminDto } from './dto/update.dto';
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
} from 'src/call-log/common/helpers/model-props-builder.helper';
import { UpdatePartialCallLogAdminDto } from './dto/update-partial.dto';

@Injectable()
export class CallLogAdminService {
  constructor(private readonly db: PrismaService) {}

  /* -------------------------------------------------------------------------- */
  /*                                    FETCH                                   */
  /* -------------------------------------------------------------------------- */
  /**
   * find all CallLog
   * @param filers
   * @param page
   * @param perPage
   * @returns
   */
  async findAll(
    filters: Prisma.CallLogWhereInput,
    page: number,
    perPage = 50,
  ): Promise<PaginatedResult<CallLog>> {
    const list = await paginate()<CallLog, Prisma.CallLogFindManyArgs>(
      this.db.callLog,
      { where: filters },
      { page, perPage },
    );

    return list;
  }

  /**
   * find one callLog
   * this method is used in the findOne controller to include or select items
   * @param id
   * @returns
   */
  async findOne(id: number): Promise<{ showProps: ShowProps[]; actions?: ShowAction[] }> {
    const item = await this.db.callLog.findUnique({ where: { id } });
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
  async findById(id: number): Promise<CallLog> {
    const item = await this.db.callLog.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('NOT_FOUND');

    return item;
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
