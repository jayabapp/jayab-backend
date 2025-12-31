import { Injectable, NotFoundException } from '@nestjs/common';
import {
  AccessControlList,
  MessengerChatroom,
  MessengerParticipant,
  Prisma,
  Property,
  User,
} from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateMessengerChatroomAdminDto } from './dto/create.dto';
import { UpdateMessengerChatroomAdminDto } from './dto/update.dto';
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
} from 'src/messenger-chatroom/common/helpers/model-props-builder.helper';
import { UpdatePartialMessengerChatroomAdminDto } from './dto/update-partial.dto';
import { UserRole } from 'src/common/interfaces/role.enum';

@Injectable()
export class MessengerChatroomAdminService {
  constructor(private readonly db: PrismaService) {}

  /* -------------------------------------------------------------------------- */
  /*                                   CREATE                                   */
  /* -------------------------------------------------------------------------- */
  /**
   * create
   * @param dto
   * @returns
   */
  async create(dto: CreateMessengerChatroomAdminDto): Promise<MessengerChatroom> {
    const newMessengerChatroom = await this.db.messengerChatroom.create({ data: dto });
    return newMessengerChatroom;
  }

  /* -------------------------------------------------------------------------- */
  /*                                    FETCH                                   */
  /* -------------------------------------------------------------------------- */
  /**
   * find all MessengerChatroom
   * @param filers
   * @param page
   * @param perPage
   * @returns
   */
  async findAll(
    filters: Prisma.MessengerChatroomWhereInput,
    page: number,
    perPage = 50,
  ): Promise<PaginatedResult<MessengerChatroom>> {
    const list = await paginate()<
      MessengerChatroom & {
        property: Property & { owner: { user: User } };
        participants: MessengerParticipant[];
      },
      Prisma.MessengerChatroomFindManyArgs
    >(
      this.db.messengerChatroom,
      {
        where: filters,
        include: {
          property: { select: { id: true, code: true, title: true, owner: { select: { user: true } } } },
          participants: true,
        },
      },
      { page, perPage },
    );

    const formatted = [];
    for (const item of list.data) {
      const property = item?.property;
      const user = item?.participants.find((e) => e.role === UserRole.USER);
      const owner = property?.owner.user;
      formatted.push({
        id: item.id,
        user,
        owner,
        property,
        updated_at: item.updated_at,
      });
    }

    return { data: formatted, meta: list.meta };
  }

  /**
   * find one messengerChatroom
   * this method is used in the findOne controller to include or select items
   * @param id
   * @returns
   */
  async findOne(id: number): Promise<{ showProps: ShowProps[]; actions?: ShowAction[] }> {
    const item = await this.db.messengerChatroom.findUnique({ where: { id } });
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
  async findById(id: number): Promise<MessengerChatroom> {
    const item = await this.db.messengerChatroom.findUnique({ where: { id } });
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
  async update(id: number, dto: UpdateMessengerChatroomAdminDto): Promise<MessengerChatroom> {
    const item = await this.db.messengerChatroom.update({
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
  async updatePartial(id: number, dto: UpdatePartialMessengerChatroomAdminDto): Promise<MessengerChatroom> {
    const item = await this.db.messengerChatroom.update({
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
    await this.db.messengerChatroom.delete({ where: { id } });
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
