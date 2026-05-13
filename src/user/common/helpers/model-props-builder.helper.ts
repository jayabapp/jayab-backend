import { AccessControlList, Prisma, User } from '@prisma/client';
import {
  AvailableAction,
  Column,
  CreateProps,
  ShowAction,
  ShowProps,
  TableProps,
} from 'src/common/interfaces/model-props.interface';

/* -------------------------------------------------------------------------- */
/*                                    TYPES                                   */
/* -------------------------------------------------------------------------- */
enum RefEnum {
  profile = 'profile',
}
type ModelFields = keyof typeof RefEnum | keyof typeof Prisma.UserScalarFieldEnum;
type ModifiedFilterProps = CreateProps & { isHidden?: boolean };
type ModifiedColumn = Column & { key: ModelFields };
type ModifiedTableProps = TableProps & { columns: ModifiedColumn[] };
const types = [
  { id: true, title: 'بله', hex: '#84cc16' },
  { id: false, title: 'خیر', hex: '#be123c' },
];

/* -------------------------------------------------------------------------- */
/*                                    SHOW                                    */
/* -------------------------------------------------------------------------- */
export const showPropsBuilder = (
  item: User,
): { showProps: Partial<ShowProps>[]; actions: Array<ShowAction> } => {
  const showProps: Array<ShowProps> = [
    { state: 'id', title: 'شناسه', value: item.id, type: 'number' },
    {
      state: 'is_banned',
      title: 'بلاک شده',
      value: types.find((type) => type.id === item.is_banned),
      isHidden: true,
    },
    {
      state: 'contact_click_limit_exceeded_at',
      title: 'بلاک شده به دلیل کلیک تا',
      value: item.contact_click_limit_exceeded_at,
      type: 'date',
    },
    {
      state: 'block_click_limit',
      title: '',
      value: types.find((type) => type.id === !!item.contact_click_limit_exceeded_at),
      type: 'boolean',
      isHidden: true,
    },
    {
      state: 'mobile_number',
      title: 'شماره موبایل',
      value: item.mobile_number,
      type: 'string',
      // isEditable: false,
    },
    {
      state: 'full_name',
      title: 'نام و نام خانوادگی',
      value: item.full_name,
      type: 'string',
      // isEditable: false,
    },
    { state: 'created_at', title: 'تاریخ ثبت نام', value: item.created_at, type: 'date' },
  ];

  /* --------------------------------- ACTIONS -------------------------------- */
  const actions: Array<ShowAction> = [
    {
      title: 'نقش مالک',
      route: `owners?user_id=${item.id}`,
    },
    {
      title: 'نقش مشاور',
      route: `advisor?user_id=${item.id}`,
    },
  ];

  return { showProps, actions };
};

/* -------------------------------------------------------------------------- */
/*                                   CREATE                                   */
/* -------------------------------------------------------------------------- */
export const createPropsBuilder = (): Array<CreateProps> => {
  const createProps: Array<CreateProps> = [
    {
      state: 'mobile_number',
      type: 'input',
      title: 'شماره موبایل',
      options: { maxLength: 11, isMandatory: true, keyboard: 'text' },
    },
    {
      state: 'is_banned',
      type: 'select',
      selectItems: [
        { id: true, title: 'بله' },
        { id: false, title: 'خیر' },
      ],
      title: 'بلاک شده',
      options: { isMandatory: true },
    },
    {
      state: 'block_click_limit',
      title: 'بلاک شده به دلیل کلیک زیاد',
      type: 'select',
      selectItems: [
        { id: true, title: 'بله' },
        { id: false, title: 'خیر' },
      ],
      options: { isMandatory: true, initValue: false },
    },
    {
      state: 'full_name',
      type: 'input',
      title: 'نام و نام خانوادگی',
      options: { maxLength: 256, isMandatory: true, keyboard: 'text' },
    },
  ];

  return createProps;
};

/* -------------------------------------------------------------------------- */
/*                                    TABLE                                   */
/* -------------------------------------------------------------------------- */
export const tablePropsBuilder = (availableActions: Array<AvailableAction>): ModifiedTableProps => {
  const tableProps: ModifiedTableProps = {
    model: 'user',
    modelTitle: 'کاربر',
    columns: [
      { id: 30, title: 'شماره موبایل', key: 'mobile_number', cellType: 'string' },
      { id: 40, title: 'مشاور', key: 'advisor_id', cellType: 'boolean' },
      { id: 50, title: 'مالک', key: 'owner_id', cellType: 'boolean' },
      { id: 60, title: 'بلاک شده', key: 'is_banned', cellType: 'boolean' },
      { id: 70, title: 'کلیک بیش از حد', key: 'contact_click_limit_exceeded_at', cellType: 'boolean' },
      { id: 90, title: 'تاریخ ثبت نام', key: 'created_at', cellType: 'dateTime' },
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
    { title: 'نقش', state: 'role', type: 'input', isHidden: true },
    { title: 'شماره موبایل', state: 'mobile_number', type: 'input' },
    { title: 'بلاک شده ها', state: 'is_banned', type: 'switch' },
    { title: 'بلاک با کلیک زیاد', state: 'contact_click_limit_exceeded_at', type: 'switch' },
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
    // if (act == 'create' && rbac.c) availableActions.push('create');
    if (act == 'show' && rbac.r) availableActions.push('show');
    if (act == 'edit' && rbac.u) availableActions.push('edit');
    // if (act == 'delete' && rbac.d) availableActions.push('delete');
    // if (act === 'submit' && rbac.u) availableActions.push('submit');
  }

  return availableActions;
};
