import { AccessControlList, FormBuilder, Prisma } from '@prisma/client';
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
import { formBuilderInputList } from '../form-builder-input-type.enum';

/* -------------------------------------------------------------------------- */
/*                                    TYPES                                   */
/* -------------------------------------------------------------------------- */
enum RefEnum {
  test = 'test',
}
type ModelFields = keyof typeof RefEnum | keyof typeof Prisma.FormBuilderScalarFieldEnum;
type ModifiedFilterProps = CreateProps & { isHidden?: boolean };
type ModifiedColumn = Column & { key: ModelFields };
type ModifiedTableProps = TableProps & { columns: ModifiedColumn[] };

/* -------------------------------------------------------------------------- */
/*                                    SHOW                                    */
/* -------------------------------------------------------------------------- */
export const showPropsBuilder = (item: FormBuilder): Array<ShowProps> => {
  const props: Array<ShowProps> = [];

  return props;
};

/* --------------------------------- ACTIONS -------------------------------- */
export const showActionBuilder = (item: FormBuilder): Array<ShowAction> => {
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
      state: 'type',
      type: 'select',
      title: 'نوع ورودی',
      selectItems: formBuilderInputList,
      options: {},
    },
    {
      state: 'title',
      type: 'input',
      title: 'عنوان',
      options: { maxLength: 100, isMandatory: true, placeholder: 'جــنس', keyboard: 'text' },
    },
    {
      state: 'sort_order',
      type: 'input',
      title: 'ترتیب نمایش',
      options: { isMandatory: false, titleHint: '(اختیاری)', keyboard: 'number' },
    },
    {
      state: 'is_mandatory',
      type: 'switch',
      title: 'الزامی',
      options: { isMandatory: true, initValue: true },
    },
    {
      state: 'description',
      type: 'textarea',
      title: 'توضیحات کوتاه',
      options: {
        isMandatory: false,
        titleHint: '(اختیاری)',
        keyboard: 'text',
        hint: 'توضیحات بیشتر در رابطه با داده ورودی',
      },
    },
    { state: 'options', type: 'tagInput', title: 'ایتم های', options: { isMandatory: true } },
  ];

  return createProps;
};

/* -------------------------------------------------------------------------- */
/*                                    TABLE                                   */
/* -------------------------------------------------------------------------- */
export const tablePropsBuilder = (availableActions: Array<AvailableAction>): ModifiedTableProps => {
  const tableProps: ModifiedTableProps = {
    model: 'formBuilder',
    modelTitle: 'فرم ساز',
    columns: [
      { id: 1, title: 'ردیف', key: 'id', cellType: 'number' },
      { id: 22, title: 'نوع ورودی', key: 'type', cellType: 'enum', enumList: formBuilderInputList },
      { id: 10, title: 'عنوان', key: 'title', cellType: 'string' },
      { id: 20, title: 'ایتم های انتخابی', key: 'options', cellType: 'arrayOfStrings' },
      { id: 30, title: 'ترتیب نمایش', key: 'sort_order', cellType: 'string', isEditable: true },
      { id: 32, title: 'الزامی', key: 'is_mandatory', cellType: 'boolean' },
      { id: 31, title: 'توضیحات', key: 'description', cellType: 'string', optionalClass: 'text-xs' },

      /* ---------------------------------- date ---------------------------------- */
      // { id: 90, title: 'تاریخ ایجاد', key: 'created_at', cellType: 'date' },
      { id: 100, title: 'تاریخ به روزرسانی', key: 'updated_at', cellType: 'date', optionalClass: 'text-xs' },
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
    { title: 'شناسه محتوا', state: 'content_id', type: 'input', isHidden: true },
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
    // if (act == 'show' && rbac.r) availableActions.push('show');
    if (act == 'edit' && rbac.u) availableActions.push('edit');
    if (act == 'delete' && rbac.d) availableActions.push('delete');
    if (act == 'submit' && rbac.u) availableActions.push('submit');
  }

  return availableActions;
};
