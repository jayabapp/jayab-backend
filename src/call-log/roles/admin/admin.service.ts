import { Injectable, NotFoundException } from '@nestjs/common';
import { AccessControlList, CallLog, Prisma, Property, User } from '@prisma/client';
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
  ): Promise<PaginatedResult<CallLog & { property: Partial<Property>; user: Partial<User> }>> {
    const list = await paginate()<
      CallLog & { property: Partial<Property>; user: Partial<User> },
      Prisma.CallLogFindManyArgs
    >(
      this.db.callLog,
      {
        where: filters,
        include: {
          property: { select: { id: true, title: true, code: true } },
          user: { select: { id: true, full_name: true, mobile_number: true } },
        },
      },
      { page, perPage },
    );

    return list;
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
