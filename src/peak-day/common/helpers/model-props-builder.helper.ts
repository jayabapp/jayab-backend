import { AccessControlList, PeakDay, Prisma } from '@prisma/client';
import {
  AvailableAction,
  Column,
  CreateProps,
  FilterProps,
  ShowAction,
  ShowProps,
  TableProps,
} from 'src/common/interfaces/model-props.interface';
import { JALAALI_DAYS, JALAALI_MONTHS, JALAALI_YEARS } from 'src/common/utils/constants/date.constant';
import { operators } from 'src/common/utils/constants/filter-operators.constant';

/* -------------------------------------------------------------------------- */
/*                                    TYPES                                   */
/* -------------------------------------------------------------------------- */
enum RefEnum {
  test = 'test',
}
type ModelFields = keyof typeof RefEnum | keyof typeof Prisma.PeakDayScalarFieldEnum;
type ModifiedFilterProps = CreateProps & { isHidden?: boolean };
type ModifiedColumn = Column & { key: ModelFields };
type ModifiedTableProps = TableProps & { columns: ModifiedColumn[] };

/* -------------------------------------------------------------------------- */
/*                                    SHOW                                    */
/* -------------------------------------------------------------------------- */
export const showPropsBuilder = (item: PeakDay): Array<ShowProps> => {
  const props: Array<ShowProps> = [
    // {state: 'id',title: 'شناسه',value: item.id,type: 'number',isEditable: false,},
    //{ state: 'title', title: 'عنوان', value: item.title, type: 'string' },
    /* ----------------------------------- REF ---------------------------------- */
    // the ids must be hidden in ref
    // ---- single ref
    // {state: 'category',title: 'دسته بندی اصلی',value: item.category,type: 'object',nestedKey: 'title',},
    // {state: 'category_id',ref: 'category',value: item.category.id,type: 'chip',isHidden: true,},
    // ---- multi ref
    // { state: 'media', title: 'عکس های ملک', value: item.media, type: 'image' },
    // { state: 'media_ids', ref: 'media', value: item.media, type: 'image', isHidden: true },
    /* --------------------------------- DIVIDER -------------------------------- */
    // { type: 'divider' },
    /* ----------------------------------- MAP ---------------------------------- */
    // {state: 'coordinate',type: 'map',value: { lat: item.lat, lng: item.lng },title: 'موقعیت جغرافیایی',},
    /* --------------------------------- SWITCH --------------------------------- */
    // { state: 'is_active', type: 'boolean', value: item.is_acitve, title: 'وضعیت' },
  ];

  return props;
};

/* --------------------------------- ACTIONS -------------------------------- */
export const showActionBuilder = (item: PeakDay): Array<ShowAction> => {
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
    { state: 'day', type: 'select', title: 'روز', selectItems: JALAALI_DAYS, options: { isMandatory: true } },
    {
      state: 'month',
      type: 'select',
      title: 'ماه',
      selectItems: JALAALI_MONTHS,
      options: { isMandatory: true },
    },
    {
      state: 'year',
      type: 'select',
      title: 'سال',
      selectItems: JALAALI_YEARS(),
      options: { isMandatory: true },
    },
    // {
    //   state: 'is_nowruz',
    //   type: 'switch',
    //   title: 'نوروز',
    //   options: {
    //     isMandatory: true,
    //     switchCheckedTitle: 'ایام نوروز',
    //     switchUncheckedTitle: 'ایام غیر نوروز',
    //   },
    // },
  ];

  return createProps;
};

/* -------------------------------------------------------------------------- */
/*                                    TABLE                                   */
/* -------------------------------------------------------------------------- */
export const tablePropsBuilder = (availableActions: Array<AvailableAction>): ModifiedTableProps => {
  const tableProps: ModifiedTableProps = {
    model: 'peakDay',
    modelTitle: 'روزهای پیک',
    columns: [
      { id: 1, title: 'ردیف', key: 'id', cellType: 'number' },
      { id: 10, title: 'روز', key: 'day', cellType: 'string' },
      { id: 20, title: 'مـاه', key: 'month', cellType: 'string' },
      { id: 30, title: 'سـال', key: 'year', cellType: 'string' },

      /* ---------------------------------- enum ---------------------------------- */
      // {id: 25,title: 'دسته بندی',key: items.category_key,cellType: 'enum',enumList: ParentCategoriesList,},
      // { id: 26, title: 'نوع', key: items.type, cellType: 'enum', enumList: BusinessTypeList },

      /* ---------------------------------- date ---------------------------------- */
      { id: 90, title: 'تاریخ ایجاد', key: 'created_at', cellType: 'dateTime' },
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
    {
      title: 'ماه',
      state: 'month',
      type: 'select',
      selectItems: JALAALI_MONTHS,
    },
    {
      title: 'سال',
      state: 'year',
      type: 'select',
      selectItems: JALAALI_YEARS(),
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
    // if (act === 'edit' && rbac.u) availableActions.push('edit');
    if (act === 'delete' && rbac.d) availableActions.push('delete');
    // if (act === 'submit' && rbac.u) availableActions.push('submit');
  }

  return availableActions;
};
