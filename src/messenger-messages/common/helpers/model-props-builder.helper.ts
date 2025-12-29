import { AccessControlList, MessengerMessages, Prisma } from '@prisma/client';
import {
  AvailableAction,
  Column,
  CreateProps,
  ShowAction,
  ShowProps,
  TableProps,
} from 'src/common/interfaces/model-props.interface';
import { MessengerMessagesReturnPartialType } from 'src/messenger-messages/roles/admin/admin.service';

/* -------------------------------------------------------------------------- */
/*                                    TYPES                                   */
/* -------------------------------------------------------------------------- */
enum RefEnum {
  user = 'user',
  owner = 'owner',
  property = 'property',
  message = 'message',
  media = 'media',
  sender = 'sender',
}
type ModelFields = keyof typeof RefEnum | keyof typeof Prisma.MessengerMessagesScalarFieldEnum;
type ModifiedFilterProps = CreateProps & { isHidden?: boolean };
type ModifiedColumn = Column & { key: ModelFields };
type ModifiedTableProps = TableProps & { columns: ModifiedColumn[] };

/* -------------------------------------------------------------------------- */
/*                                    SHOW                                    */
/* -------------------------------------------------------------------------- */
export const showPropsBuilder = (item: MessengerMessagesReturnPartialType): Array<ShowProps> => {
  const props: Array<ShowProps> = [
    { state: 'id', title: 'شناسه', value: item.id, type: 'number' },
    { state: 'sender', title: 'فرستنده پیام', value: item.sender, type: 'string' },
    {
      state: 'created_at',
      title: 'تاریخ ایجاد',
      value: item.created_at,
      type: 'string',
    },

    { type: 'break' },
    {
      state: 'user',
      title: 'مشتری',
      value: item.user,
      type: 'object',
      nestedKey: 'user_mobile_number',
      route: `/users/show/${item.user.user_id}`,
    },
    {
      state: 'owner',
      title: 'مالک',
      value: item.owner,
      type: 'object',
      nestedKey: 'full_name',
      route: `/users/show/${item.owner.id}`,
    },
    {
      state: 'property',
      title: 'ملک',
      type: 'object',
      value: item.property,
      nestedKey: 'title',
      route: `/properties/show/${item.property.id}`,
    },

    { type: 'break' },
    { state: 'message', title: 'متن پیام', value: item.message, type: 'longString' },
  ];

  return props;
};

/* --------------------------------- ACTIONS -------------------------------- */
export const showActionBuilder = (item: MessengerMessages): Array<ShowAction> => {
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
  const createProps: Array<CreateProps> = [
    /* ---------------------------------- IMAGE --------------------------------- */
    // {state: 'image_id',type: 'image',title: 'تصویر اصلی',options: { isMandatory: true, titleHint: 'تنها یک عکس میتوانید آپلود کنید' },},
    /* ------------------------------ MULTI IMAGES ------------------------------ */
    // {state: 'media_ids',type: 'image',title: 'تصاویر ملک',options: { isMandatory: true, titleHint: 'آپلود حداقل یک مورد الزامی است', multiImage: true },},
    /* ---------------------------------- TEXT ---------------------------------- */
    // {state: 'title',type: 'input',title: 'عنوان',options: { maxLength: 100, isMandatory: true, placeholder: 'کد تخفیف تابستانه', keyboard: 'text' },},
    /* --------------------------------- NUMBER --------------------------------- */
    // {state: 'percentage',type: 'input',title: 'درصد تخفیف',options: { isMandatory: true, keyboard: 'number', convertToText: true,hint: 'سقف استفاده از تخفیف' },},
    /* ---------------------------------- DATE ---------------------------------- */
    // {state: 'start_at',type: 'date',title: 'تاریخ شروع کد تخفیف',options: { keyboard: 'number', isMandatory: true, convertToText: true },},
    /* --------------------------------- SELECT --------------------------------- */
    // {state: 'category_id',type: 'select',title: 'دسته بندی اصلی',selectItems: parentCategories,options: { isMandatory: true },},
    /* ------------------------------ MULTI SELECT ------------------------------ */
    // {state: 'tag_ids',type: 'multiSelect',title: 'تگ ها',selectItems: tags,options: {},},
    /* -------------------------------- TEXT AREA ------------------------------- */
    // {state: 'description',type: 'textarea',title: 'توضیحات',options: { keyboard: 'text', maxLength: 300 },},
    /* ----------------------------------- MAP ---------------------------------- */
    // {state: 'coordinate',type: 'map',title: 'موقعیت جغرافیایی',options: { isMandatory: true },},
    /* --------------------------------- DIVIDER -------------------------------- */
    // { type: 'divider' },
  ];

  return createProps;
};

/* -------------------------------------------------------------------------- */
/*                                    TABLE                                   */
/* -------------------------------------------------------------------------- */
export const tablePropsBuilder = (availableActions: Array<AvailableAction>): ModifiedTableProps => {
  const tableProps: ModifiedTableProps = {
    model: 'messengerMessages',
    modelTitle: 'چت',
    columns: [
      {
        id: 30,
        title: 'ملک',
        key: 'property',
        cellType: 'object',
        nestedKey: 'title',
        link: '/properties/show',
      },
      { id: 70, title: 'کد ملک', key: 'property', cellType: 'object', nestedKey: 'code' },
      {
        id: 10,
        title: 'مشتری',
        key: 'user',
        cellType: 'object',
        nestedKey: 'user_mobile_number',
        link: '/users/show',
      },
      {
        id: 20,
        title: 'مالک',
        key: 'owner',
        cellType: 'object',
        nestedKey: 'full_name',
        link: '/users/show',
      },
      { id: 50, title: 'فرستنده پیام', key: 'sender', cellType: 'string' },
      { id: 60, title: 'متن پیام', key: 'message', cellType: 'string', optionalClass: 'text-sm' },
      { id: 90, title: 'تاریخ ایجاد', key: 'created_at', cellType: 'dateTime' },
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
      title: '',
      state: 'user_id',
      type: 'input',
      isHidden: true,
    },
    {
      title: '',
      state: 'chatroom_id',
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
    if (act === 'show' && rbac.r) availableActions.push('show');
    // if (act === 'edit' && rbac.u) availableActions.push('edit');
    // if (act === 'delete' && rbac.d) availableActions.push('delete');
    // if (act === 'submit' && rbac.u) availableActions.push('submit');
  }

  return availableActions;
};
