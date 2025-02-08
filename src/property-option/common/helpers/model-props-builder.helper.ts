import { AccessControlList, PropertyOption, Prisma, Attachment } from '@prisma/client';
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
import { PropertyOptionGroup, PropertyOptionGroupList } from '../property-option-groups.type';

/* -------------------------------------------------------------------------- */
/*                                    TYPES                                   */
/* -------------------------------------------------------------------------- */
enum RefEnum {
  image = 'image',
}
type ModelFields = keyof typeof RefEnum | keyof typeof Prisma.PropertyOptionScalarFieldEnum;
type ModifiedFilterProps = CreateProps & { isHidden?: boolean };
type ModifiedColumn = Column & { key: ModelFields };
type ModifiedTableProps = TableProps & { columns: ModifiedColumn[] };

/* -------------------------------------------------------------------------- */
/*                                    SHOW                                    */
/* -------------------------------------------------------------------------- */
export const showPropsBuilder = (item: PropertyOption & { image: Attachment }): Array<ShowProps> => {
  const props: Array<ShowProps> = [
    // { state: 'id', title: 'شناسه', value: item.id, type: 'number' },
    {
      state: 'group',
      title: 'گروه',
      value: PropertyOptionGroupList.find((e) => e.id == item.group),
      type: 'chip',
    },
    { type: 'break' },
    { state: 'title', title: 'عنوان', value: item.title, type: 'string' },
    { state: 'sort', title: 'ترتیب', value: item.sort, type: 'number' },
    { type: 'break' },
    { state: 'description', title: 'توضیحات', value: item.description, type: 'longString' },
    { type: 'divider' },
    { state: 'created_at', title: 'تاریخ ثبت', value: item.created_at, type: 'date' },
    { state: 'updated_at', title: 'تاریخ ویرایش', value: item.updated_at, type: 'date' },
    { type: 'divider' },
    { state: 'image', title: 'تصویر', value: item.image, type: 'image' },
    { state: 'image_id', title: 'تصویر', value: item.image_id, ref: 'image', type: 'image', isHidden: true },
  ];

  return props;
};

/* --------------------------------- ACTIONS -------------------------------- */
export const showActionBuilder = (item: PropertyOption): Array<ShowAction> => {
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
      options: { maxLength: 128, isMandatory: true, placeholder: 'کولر گازی', keyboard: 'text' },
    },
    {
      state: 'group',
      type: 'select',
      title: 'گروه',
      selectItems: PropertyOptionGroupList,
      options: { maxLength: 128, isMandatory: true },
    },
    {
      state: 'sort',
      type: 'input',
      title: 'ترتیب',
      options: { isMandatory: false, placeholder: '12', keyboard: 'number' },
    },
    {
      state: 'key',
      type: 'input',
      title: 'کلید انگلیسی',
      options: { isMandatory: false, placeholder: 'Ex: pool', keyboard: 'text', titleHint: '(اختیاری)' },
    },
    { type: 'break' },
    {
      state: 'image_id',
      type: 'image',
      title: 'تصویر',
      options: { isMandatory: false, titleHint: '(اختیاری)' },
    },
    // {
    //   state: 'description',
    //   type: 'input',
    //   title: 'توضیحات',
    //   options: { maxLength: 256, isMandatory: false, keyboard: 'text' },
    // },
  ];

  return createProps;
};

/* -------------------------------------------------------------------------- */
/*                                    TABLE                                   */
/* -------------------------------------------------------------------------- */
export const tablePropsBuilder = (availableActions: Array<AvailableAction>): ModifiedTableProps => {
  const tableProps: ModifiedTableProps = {
    model: 'propertyOption',
    modelTitle: 'آپشن',
    columns: [
      { id: 1, title: 'ردیف', key: 'id', cellType: 'number' },
      { id: 10, title: 'عنوان', key: 'title', cellType: 'string' },
      { id: 11, title: 'تصویر', key: 'image', cellType: 'image' },
      { id: 20, title: 'گروه', key: 'group', cellType: 'enum', enumList: PropertyOptionGroupList },
      { id: 30, title: 'ترتیب', key: 'sort', cellType: 'number' },
      // { id: 90, title: 'تاریخ ایجاد', key: 'created_at', cellType: 'dateTime' },
      // { id: 100, title: 'تاریخ به روزرسانی', key: 'updated_at', cellType: 'dateTime' },
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
    { title: 'عنوان', state: 'title', type: 'input' },
    { title: 'گروه', state: 'group', type: 'select', selectItems: PropertyOptionGroupList },
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
    if (act === 'delete' && rbac.d) availableActions.push('delete');
    // if (act === 'submit' && rbac.u) availableActions.push('submit');
  }

  return availableActions;
};
