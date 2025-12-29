import { Injectable, NotFoundException } from '@nestjs/common';
import {
  AccessControlList,
  Attachment,
  MessengerChatroom,
  MessengerMessages,
  MessengerParticipant,
  Owner,
  Prisma,
  Property,
  User,
} from '@prisma/client';
import moment from 'moment-jalaali';
import { ExcelCol, saveToExcel, SHEET_NAME } from 'src/common/helpers/excel-creator.helper';
import { type PaginatedResult, paginate } from 'src/common/helpers/paginator';
import {
  CreateProps,
  OperatorItems,
  ShowAction,
  ShowProps,
  TableProps,
} from 'src/common/interfaces/model-props.interface';
import { UserRole } from 'src/common/interfaces/role.enum';
import { operatorsList } from 'src/common/utils/constants/filter-operators.constant';
import {
  allActionsBuilder,
  createPropsBuilder,
  filterPropsBuilder,
  showActionBuilder,
  showPropsBuilder,
  tablePropsBuilder,
} from 'src/messenger-messages/common/helpers/model-props-builder.helper';
import { PrismaService } from 'src/prisma/prisma.service';

export type MessengerMessagesReturnPartialType = {
  id: number;
  chatroom_id: number;
  user: MessengerParticipant;
  owner: User;
  property: Property;
  message: string;
  sender: string;
  created_at: string;
};

@Injectable()
export class MessengerMessagesAdminService {
  constructor(private readonly db: PrismaService) {}

  /* -------------------------------------------------------------------------- */
  /*                                    FETCH                                   */
  /* -------------------------------------------------------------------------- */
  /**
   * find all MessengerMessages
   * @param filers
   * @param page
   * @param perPage
   * @returns
   */
  async findAll(
    filters: Prisma.MessengerMessagesWhereInput,
    page: number,
    perPage = 50,
    skip?: number,
  ): Promise<PaginatedResult<MessengerMessagesReturnPartialType>> {
    const list = await paginate()<
      MessengerMessages & {
        media: Attachment;
        participant: MessengerParticipant;
        chatroom: MessengerChatroom & { property: Property & { owner: Owner & { user: User } } };
      },
      Prisma.MessengerMessagesFindManyArgs
    >(
      this.db.messengerMessages,
      {
        where: filters,
        include: {
          media: true,
          participant: true,
          chatroom: { include: { property: { include: { owner: { include: { user: true } } } } } },
        },
      },
      { page, perPage, skip },
    );

    const newList = list.data.map((e) => {
      const property = e?.chatroom?.property;
      const user = e?.participant;
      const owner = property?.owner.user;
      const sender = e?.participant.role == UserRole.USER ? 'مشتری' : 'مالک';

      return {
        id: e.id,
        chatroom_id: e.chatroom_id,
        user,
        owner,
        property,
        message: e.text,
        media: e.media,
        sender,
        created_at: e.created_at,
      };
    });

    return { data: newList as any, meta: list.meta };
  }

  /**
   * find one messengerMessages
   * this method is used in the findOne controller to include or select items
   * @param id
   * @returns
   */
  async findOne(id: number): Promise<{ showProps: ShowProps[]; actions?: ShowAction[] }> {
    const item = await this.db.messengerMessages.findUnique({
      where: { id },
      include: {
        participant: true,
        chatroom: { include: { property: { include: { owner: { include: { user: true } } } } } },
        media: true,
      },
    });
    if (!item) throw new NotFoundException('NOT_FOUND');

    const property = item?.chatroom?.property;
    const user = item?.participant;
    const owner = property?.owner.user as User;
    const sender = item?.participant.role == UserRole.USER ? 'مشتری' : 'مالک';

    const showProps = showPropsBuilder({
      id: item.id,
      chatroom_id: item.chatroom_id,
      user,
      owner,
      property,
      message: item.text,
      sender,
      created_at: moment(item.created_at).format('jYYYY/jMM/jDD HH:MM:SS'),
    });
    const actions = showActionBuilder(item);

    return { showProps, actions };
  }

  /* -------------------------------------------------------------------------- */
  /*                                    EXCEL                                   */
  /* -------------------------------------------------------------------------- */
  async createExcel(list: MessengerMessagesReturnPartialType[]): Promise<any> {
    const newList = list.map((e) => {
      return {
        id: e.id,
        customer_mobile_number: e?.user.user_mobile_number,
        owner_full_name: e.owner.full_name,
        property_name: e?.property.title,
        property_code: e?.property.code,
        sender: e?.sender,
        message: e.message,
        created_at: moment(e.created_at).format('jYYYY/jMM/jDD HH:MM:SS'),
      };
    });

    const excelCols: ExcelCol[] = [
      { header: 'شناسه پیام', key: 'id', width: 15 },
      { header: 'نام ملک', key: 'property_name', width: 50 },
      { header: 'کد ملک', key: 'property_code', width: 10 },
      { header: 'موبایل مشتری', key: 'customer_mobile_number', width: 15 },
      { header: 'نام مالک', key: 'owner_full_name', width: 20 },
      { header: 'فرستنده پیام', key: 'sender', width: 15 },
      { header: 'تاریخ ایجاد', key: 'created_at', width: 25 },
      { header: 'پیام', key: 'message', width: 100 },
    ];

    const url = await saveToExcel(excelCols, newList, SHEET_NAME.MESSENGER_MESSAGES);
    return url;
  }

  // /**
  //  * find by id
  //  * @param id
  //  * @returns
  //  */
  // async findById(id: number): Promise<MessengerMessages> {
  //   const item = await this.db.messengerMessages.findUnique({ where: { id } });
  //   if (!item) throw new NotFoundException('NOT_FOUND');

  //   return item;
  // }

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
