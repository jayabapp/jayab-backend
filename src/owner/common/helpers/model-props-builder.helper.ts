import { AccessControlList, Attachment, Owner, Prisma, User } from '@prisma/client';
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
import { OwnerStatus, OwnerStatusList } from '../owner-status.type';

/* -------------------------------------------------------------------------- */
/*                                    TYPES                                   */
/* -------------------------------------------------------------------------- */
enum RefEnum {
  user = 'user',
}
type ModelFields = keyof typeof RefEnum | keyof typeof Prisma.OwnerScalarFieldEnum;
type ModifiedFilterProps = CreateProps & { isHidden?: boolean };
type ModifiedColumn = Column & { key: ModelFields };
type ModifiedTableProps = TableProps & { columns: ModifiedColumn[] };

/* -------------------------------------------------------------------------- */
/*                                    SHOW                                    */
/* -------------------------------------------------------------------------- */
export const showPropsBuilder = (
  item: Owner & { user: User & { profile_image: Attachment } },
): Array<ShowProps> => {
  const statuses = OwnerStatusList.filter((e) => e.id !== OwnerStatus.AUTO_CHECK_SERVICE_ERROR);
  const props: Array<ShowProps> = [
    { state: 'status_list', title: 'لیست وضعیت ها', value: statuses, isHidden: true },
    {
      state: 'admin_descriptions',
      title: 'توضیحات ادمین',
      value: item.admin_descriptions,
      type: 'string',
      isEditable: false,
      isHidden: true,
    },
    { state: 'id', title: 'شناسه', value: item.id, type: 'string' },
    {
      state: 'status',
      title: 'وضعیت',
      value: OwnerStatusList.find((e) => e.id == item.status),
      type: 'chip',
    },
    { type: 'break' },
    {
      state: 'full_name',
      title: 'نام و نام خانوادگی',
      value: item.user.full_name,
      type: 'string',
      route: `/users/edit/${item.user.id}`,
    },
    {
      state: 'mobile_number',
      title: 'موبایل',
      value: item.user.mobile_number,
      type: 'string',
    },
    { type: 'break' },
    { state: 'created_at', title: 'تاریخ ثبت نام', value: item.created_at, type: 'date' },
    { state: 'updated_at', title: 'تاریخ به روز رسانی', value: item.updated_at, type: 'date' },
    { type: 'divider' },
    {
      state: 'profile_image',
      title: 'تصویر پروفایل',
      value: item.user.profile_image,
      type: 'image',
      isEditable: false,
    },
  ];

  return props;
};

/* --------------------------------- ACTIONS -------------------------------- */
export const showActionBuilder = (item: Owner): Array<ShowAction> => {
  const actions: Array<ShowAction> = [
    {
      title: 'املاک',
      route: `/properties?page=1&owner_id=${item.id}`,
    },
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
    model: 'owner',
    modelTitle: 'مالک',
    columns: [
      { id: 10, title: 'تصویر', key: 'user', cellType: 'image', nestedKey: 'profile_image' },
      { id: 20, title: 'نام و نام خانوادگی', key: 'user', cellType: 'object', nestedKey: 'full_name' },
      { id: 30, title: 'موبایل', key: 'user', cellType: 'object', nestedKey: 'mobile_number' },
      { id: 80, title: 'وضعیت', key: 'status', cellType: 'enum', enumList: OwnerStatusList },
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
    { title: 'شماره موبایل', state: 'mobile_number', type: 'input' },
    { title: 'نام و نام خانوادگی', state: 'full_name', type: 'input' },
    { title: '', state: 'status', type: 'select', isHidden: true },
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
