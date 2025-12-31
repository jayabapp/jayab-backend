import { AccessControlList, MessengerChatroom, Prisma } from '@prisma/client';
import {
  AvailableAction,
  Column,
  CreateProps,
  FilterProps,
  ShowAction,
  ShowProps,
  TableProps,
} from 'src/common/interfaces/model-props.interface';
import { operators } from 'src/common/utils/constants/filter-operators.constant';

/* -------------------------------------------------------------------------- */
/*                                    TYPES                                   */
/* -------------------------------------------------------------------------- */
enum RefEnum {
  property = 'property',
  owner = 'owner',
  user = 'user',
}
type ModelFields = keyof typeof RefEnum | keyof typeof Prisma.MessengerChatroomScalarFieldEnum;
type ModifiedFilterProps = CreateProps & { isHidden?: boolean };
type ModifiedColumn = Column & { key: ModelFields };
type ModifiedTableProps = TableProps & { columns: ModifiedColumn[] };

/* -------------------------------------------------------------------------- */
/*                                    SHOW                                    */
/* -------------------------------------------------------------------------- */
export const showPropsBuilder = (item: MessengerChatroom): Array<ShowProps> => {
  const props: Array<ShowProps> = [];

  return props;
};

/* --------------------------------- ACTIONS -------------------------------- */
export const showActionBuilder = (item: MessengerChatroom): Array<ShowAction> => {
  const actions: Array<ShowAction> = [
    //  {
    //    title: 'لیست محصولات',
    //    route: `/business-products?page=1&filters=filters%5Bbusiness_id%5D%5Bequals%5D=${item.id}`,
    //  },
    //  {
    //    title: 'ایجاد محصول جدید',
    //    route: '',
    //  },
  ];

  return actions;
};

/* -------------------------------------------------------------------------- */
/*                                   CREATE                                   */
/* -------------------------------------------------------------------------- */
export const createPropsBuilder = (): Array<CreateProps> => {
  const createProps: Array<CreateProps> = [];

  return createProps;
};

/* -------------------------------------------------------------------------- */
/*                                    TABLE                                   */
/* -------------------------------------------------------------------------- */
export const tablePropsBuilder = (availableActions: Array<AvailableAction>): ModifiedTableProps => {
  const tableProps: ModifiedTableProps = {
    model: 'messengerChatroom',
    modelTitle: 'چت روم',
    columns: [
      {
        id: 5,
        title: 'آگهی',
        key: 'property',
        cellType: 'object',
        nestedKey: 'title',
        link: '/properties/show/',
      },
      { id: 6, title: 'کد ملک', key: 'property', cellType: 'object', nestedKey: 'code' },
      { id: 10, title: 'مشتری', key: 'user', cellType: 'object', nestedKey: 'user_mobile_number' },
      { id: 20, title: 'نام مالک', key: 'owner', cellType: 'object', nestedKey: 'full_name' },
      { id: 22, title: 'شماره مالک', key: 'owner', cellType: 'object', nestedKey: 'mobile_number' },

      /* ---------------------------------- date ---------------------------------- */
      // { id: 90, title: 'تاریخ ایجاد', key: 'created_at', cellType: 'dateTime' },
      { id: 100, title: 'تاریخ به روزرسانی', key: 'updated_at', cellType: 'dateTime' },
    ],
    availableActions,
  };

  return tableProps;
};

/* -------------------------------------------------------------------------- */
/*                                   FILTER                                   */
/* -------------------------------------------------------------------------- */
export const filterPropsBuilder = (): ModifiedFilterProps[] => {
  const filterProps: Array<ModifiedFilterProps> = [
    {
      title: 'کد ملک',
      state: 'property_code',
      type: 'input',
    },
    {
      title: 'عنوان ملک',
      state: 'property_title',
      type: 'input',
    },
    {
      title: '',
      state: 'property_id',
      type: 'input',
      isHidden: true,
    },
  ];

  return filterProps;
};

/* -------------------------------------------------------------------------- */
/*                                ADMIN ACTIONS                               */
/* -------------------------------------------------------------------------- */
export const allActionsBuilder = (rbac: AccessControlList): Array<AvailableAction> => {
  const allActions: Array<AvailableAction> = ['create', 'show', 'edit', 'delete', 'submit'];
  const availableActions: Array<AvailableAction> = [];

  for (const act of allActions) {
    // if (act === 'create' && rbac.c) availableActions.push('create');
    // if (act === 'show' && rbac.r) availableActions.push('show');
    // if (act === 'edit' && rbac.u) availableActions.push('edit');
    // if (act === 'delete' && rbac.d) availableActions.push('delete');
    // if (act === 'submit' && rbac.u) availableActions.push('submit');
  }

  return availableActions;
};
