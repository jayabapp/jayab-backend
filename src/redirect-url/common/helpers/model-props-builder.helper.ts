import { AccessControlList, RedirectUrl, Prisma } from '@prisma/client';
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
  test = 'test',
}
type ModelFields = keyof typeof RefEnum | keyof typeof Prisma.RedirectUrlScalarFieldEnum;
type ModifiedFilterProps = CreateProps & { isHidden?: boolean };
type ModifiedColumn = Column & { key: ModelFields };
type ModifiedTableProps = TableProps & { columns: ModifiedColumn[] };

/* -------------------------------------------------------------------------- */
/*                                    SHOW                                    */
/* -------------------------------------------------------------------------- */
export const showPropsBuilder = (item: RedirectUrl): Array<ShowProps> => {
  const props: Array<ShowProps> = [
    { state: 'source', type: 'string', title: 'source', value: item.source },
    { state: 'destination', type: 'string', title: 'destination', value: item.destination },
    { state: 'permanent', type: 'boolean', title: 'permanent', value: item.permanent },
  ];

  return props;
};

/* --------------------------------- ACTIONS -------------------------------- */
export const showActionBuilder = (item: RedirectUrl): Array<ShowAction> => {
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
    {
      state: 'source',
      type: 'textarea',
      title: 'source',
      options: { isMandatory: true, containerClass: 'ltr text-left col-span-full md:col-span-2' },
    },
    {
      state: 'destination',
      type: 'textarea',
      title: 'destination',
      options: { isMandatory: true, containerClass: 'ltr text-left col-span-full md:col-span-2' },
    },
    {
      state: 'permanent',
      type: 'switch',
      title: 'permanent',
      options: { initValue: false, isMandatory: true },
    },
  ];

  return createProps;
};

/* -------------------------------------------------------------------------- */
/*                                    TABLE                                   */
/* -------------------------------------------------------------------------- */
export const tablePropsBuilder = (availableActions: Array<AvailableAction>): ModifiedTableProps => {
  const tableProps: ModifiedTableProps = {
    model: 'redirectUrl',
    modelTitle: 'ریدایرکت',
    columns: [
      {
        id: 10,
        title: 'مبدا',
        key: 'source',
        cellType: 'string',
        optionalClass: 'max-w-[80px] text-sm text-center ltr',
      },
      {
        id: 20,
        title: 'مقصد',
        key: 'destination',
        cellType: 'string',
        optionalClass: 'max-w-[80px] text-sm text-center ltr',
      },
      { id: 30, title: 'permanent', key: 'permanent', cellType: 'boolean' },
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
      title: 'source',
      state: 'source',
      type: 'input',
    },
    {
      title: 'destination',
      state: 'destination',
      type: 'input',
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
    if (act === 'create' && rbac.c) availableActions.push('create');
    // if (act === 'show' && rbac.r) availableActions.push('show');
    if (act === 'edit' && rbac.u) availableActions.push('edit');
    if (act === 'delete' && rbac.d) availableActions.push('delete');
    // if (act === 'submit' && rbac.u) availableActions.push('submit');
  }

  return availableActions;
};
