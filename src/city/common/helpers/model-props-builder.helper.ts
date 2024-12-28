import { AccessControlList, Prisma, City } from '@prisma/client';
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
enum RefEnum {}
type ModelFields = keyof typeof RefEnum | keyof typeof Prisma.CityScalarFieldEnum;
type ModifiedFilterProps = FilterProps;
type ModifiedColumn = Column & { key: ModelFields };
type ModifiedTableProps = TableProps & { columns: ModifiedColumn[] };

/* -------------------------------------------------------------------------- */
/*                                    SHOW                                    */
/* -------------------------------------------------------------------------- */
export const showPropsBuilder = (item: City): Array<ShowProps> => {
  const props: Array<ShowProps> = [
    {
      state: 'title',
      title: 'عنوان',
      value: item.title,
      type: 'string',
    },
    {
      state: 'sort_order',
      title: 'ترتیب نمایش',
      value: item.sort_order,
      type: 'string',
    },
  ];

  return props;
};

/* --------------------------------- ACTIONS -------------------------------- */
export const showActionBuilder = (): Array<ShowAction> => {
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
      state: 'title',
      type: 'input',
      title: 'عنوان',
      options: { maxLength: 256, isMandatory: true, placeholder: 'تهران', keyboard: 'text' },
    },
    {
      state: 'sort_order',
      type: 'input',
      title: 'ترتیب نمایش',
      options: { placeholder: 'مثلا: 1', keyboard: 'number', titleHint: '(اختیاری)' },
    },
  ];

  return createProps;
};

/* -------------------------------------------------------------------------- */
/*                                    TABLE                                   */
/* -------------------------------------------------------------------------- */
export const tablePropsBuilder = (availableActions: Array<AvailableAction>): ModifiedTableProps => {
  const tableProps: ModifiedTableProps = {
    model: 'city',
    modelTitle: 'شهر',
    columns: [],
    availableActions,
  };

  return tableProps;
};

/* -------------------------------------------------------------------------- */
/*                                   FILTER                                   */
/* -------------------------------------------------------------------------- */
export const filterPropsBuilder = (): ModifiedFilterProps[] => {
  const filterProps: Array<ModifiedFilterProps> = [
    { id: 1, title: 'شناسه', key: 'id', type: 'number', operators: [operators.equals] },
    { id: 10, title: 'نام', key: 'title', type: 'string', operators: [operators.contains] },
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
    if (act == 'create' && rbac.c) availableActions.push('create');
    if (act == 'show' && rbac.r) availableActions.push('show');
    if (act == 'edit' && rbac.u) availableActions.push('edit');
    if (act == 'delete' && rbac.d) availableActions.push('delete');
    // if (act == 'submit' && rbac.u) availableActions.push('submit');
  }

  return availableActions;
};
