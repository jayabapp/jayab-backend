import { AccessControlList, SubscriptionPlan, Prisma } from '@prisma/client';
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
import { SubscriptionPlanGroup, SubscriptionPlanGroupList } from '../subscription-plan-group.type';

/* -------------------------------------------------------------------------- */
/*                                    TYPES                                   */
/* -------------------------------------------------------------------------- */
enum RefEnum {
  test = 'test',
}
type ModelFields = keyof typeof RefEnum | keyof typeof Prisma.SubscriptionPlanScalarFieldEnum;
type ModifiedFilterProps = CreateProps & { isHidden?: boolean };
type ModifiedColumn = Column & { key: ModelFields };
type ModifiedTableProps = TableProps & { columns: ModifiedColumn[] };

/* -------------------------------------------------------------------------- */
/*                                    SHOW                                    */
/* -------------------------------------------------------------------------- */
export const showPropsBuilder = (item: SubscriptionPlan): Array<ShowProps> => {
  const props: Array<ShowProps> = [
    { state: 'id', title: 'شناسه', value: item.id, type: 'number', isEditable: false },
    {
      state: 'group',
      title: 'گروه',
      value: SubscriptionPlanGroupList.find((e) => e.id == item.group),
      type: 'chip',
    },
    { state: 'is_active', title: 'فعال', value: item.is_active, type: 'boolean', isEditable: false },
    { type: 'break' },
    { state: 'title', title: 'عنوان', value: item.title, type: 'string' },
    { state: 'sort', title: 'ترتیب', value: item.sort, type: 'number' },
    { type: 'break' },
    { state: 'duration', title: 'مدت زمان', value: item.duration, type: 'number' },
    { state: 'price', title: 'قیمت (تومان)', value: item.price, type: 'number' },
    {
      state: 'price_with_discount',
      title: '(تومان) قیمت با تخفیف',
      value: item.price_with_discount,
      type: 'number',
    },
    {
      state: 'description',
      title: 'توضیحات',
      value: item.description,
      type: 'longString',
    },
  ];

  return props;
};

/* --------------------------------- ACTIONS -------------------------------- */
export const showActionBuilder = (item: SubscriptionPlan): Array<ShowAction> => {
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
      options: { maxLength: 128, isMandatory: true, placeholder: 'یک ماهه', keyboard: 'text' },
    },
    {
      state: 'duration',
      type: 'input',
      title: 'مدت زمان',
      options: {
        isMandatory: true,
        placeholder: '30',
        keyboard: 'number',
        unit: 'روز',
        hint: 'از ۱ تا ۳۶۵ روز',
      },
    },
    {
      state: 'is_active',
      type: 'switch',
      title: 'فعال',
      options: { isMandatory: true, disabled: true },
    },
    { type: 'break' },
    {
      state: 'price',
      type: 'input',
      title: 'قیمت',
      options: {
        isMandatory: true,
        placeholder: '100000',
        keyboard: 'number',
        unit: 'تومان',
        hint: 'از صفر تا ۱۰۰ میلیون تومان',
      },
    },
    {
      state: 'price_with_discount',
      type: 'input',
      title: 'قیمت با تخفیف',
      options: {
        isMandatory: true,
        placeholder: '100000',
        keyboard: 'number',
        unit: 'تومان',
        hint: 'از صفر تا ۱۰۰ میلیون تومان',
      },
    },
    { type: 'break' },
    {
      state: 'sort',
      type: 'input',
      title: 'ترتیب',
      options: {
        isMandatory: true,
        placeholder: '5',
        keyboard: 'number',
      },
    },
    {
      state: 'group',
      type: 'select',
      title: 'گروه',
      selectItems: SubscriptionPlanGroupList,
      options: { isMandatory: true },
    },
    { type: 'break' },
    {
      state: 'description',
      type: 'textarea',
      title: 'توضیحات',
    },
  ];

  return createProps;
};

/* -------------------------------------------------------------------------- */
/*                                    TABLE                                   */
/* -------------------------------------------------------------------------- */
export const tablePropsBuilder = (availableActions: Array<AvailableAction>): ModifiedTableProps => {
  const tableProps: ModifiedTableProps = {
    model: 'subscriptionPlan',
    modelTitle: 'پلن',
    columns: [
      { id: 1, title: 'ردیف', key: 'id', cellType: 'number' },
      { id: 10, title: 'عنوان', key: 'title', cellType: 'string' },
      { id: 20, title: 'گروه', key: 'group', cellType: 'enum', enumList: SubscriptionPlanGroupList },
      { id: 30, title: 'قیمت (تومان)	', key: 'price', cellType: 'number' },
      { id: 40, title: 'فعال بودن', key: 'is_active', cellType: 'boolean' },
      { id: 50, title: 'مدت زمان (روز)	', key: 'duration', cellType: 'number' },
      { id: 60, title: 'ترتیب نمایش', key: 'sort', cellType: 'number' },
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
      type: 'input',
      isHidden: true,
      state: 'group',
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
    if (act === 'show' && rbac.r) availableActions.push('show');
    if (act === 'edit' && rbac.u) availableActions.push('edit');
    // if (act === 'delete' && rbac.d) availableActions.push('delete');
    // if (act === 'submit' && rbac.u) availableActions.push('submit');
  }

  return availableActions;
};
