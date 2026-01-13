import { AccessControlList, Prisma, PropertyReport } from '@prisma/client';
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
  user = 'user',
  property = 'property',
}
type ModelFields = keyof typeof RefEnum | keyof typeof Prisma.PropertyReportScalarFieldEnum;
type ModifiedFilterProps = CreateProps & { isHidden?: boolean };
type ModifiedColumn = Column & { key: ModelFields };
type ModifiedTableProps = TableProps & { columns: ModifiedColumn[] };

/* -------------------------------------------------------------------------- */
/*                                    SHOW                                    */
/* -------------------------------------------------------------------------- */
export const showPropsBuilder = (item: PropertyReport): Array<ShowProps> => {
  const props: Array<ShowProps> = [
    { state: 'seen_by_admin', title: 'بررسی شده', value: item.seen_by_admin, type: 'boolean' },
    { type: 'break' },
    { state: 'title', title: 'عنوان', value: item.title, type: 'string' },
    { state: 'description', title: 'توضیحات', value: item.description, type: 'longString' },
    { type: 'break' },
    { state: 'created_at', title: 'تاریخ ثبت', value: item.created_at, type: 'date' },
    /* ----------------------------------- REF ---------------------------------- */
    // the ids must be hidden in ref
    // ---- single ref
    // {state: 'category',title: t('CATEGORY'),value: item.category,type: 'object',nestedKey: 'title',},
    // {state: 'category_id',ref: 'category',value: item.category.id,type: 'chip',isHidden: true,},
    // ---- multi ref
    // { state: 'media', title: t('MEDIA'), value: item.media, type: 'image' },
    // { state: 'media_ids', ref: 'media', value: item.media, type: 'image', isHidden: true },
    /* --------------------------------- DIVIDER -------------------------------- */
    // { type: 'divider' },
    /* ----------------------------------- MAP ---------------------------------- */
    // {state: 'coordinate',type: 'map',value: { lat: item.lat, lng: item.lng },title: ('COORDINATE'),},
    /* --------------------------------- SWITCH --------------------------------- */
    // { state: 'is_active', type: 'boolean', value: item.is_acitve, title: ('IS_ACTIVE') },
  ];

  return props;
};

/* --------------------------------- ACTIONS -------------------------------- */
export const showActionBuilder = (item: PropertyReport): Array<ShowAction> => {
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
    // {state: 'image_id',type: 'image',title: t('IMAGE'),options: { isMandatory: true, titleHint: t('IMAGE_HINT') },},
    /* ------------------------------ MULTI IMAGES ------------------------------ */
    // {state: 'media_ids',type: 'image',title: t('MEDIA'),options: { isMandatory: true, titleHint: 'آپلود حداقل یک مورد الزامی است', multiImage: true },},
    /* ---------------------------------- TEXT ---------------------------------- */
    // {state: 'title',type: 'input',title: t('TITLE'),options: { maxLength: 100, isMandatory: true, placeholder: 'کد تخفیف تابستانه', keyboard: 'text' },},
    /* --------------------------------- NUMBER --------------------------------- */
    // {state: 'percentage',type: 'input',title: 'درصد تخفیف',options: { isMandatory: true, keyboard: 'number', convertToText: true,hint: 'سقف استفاده از تخفیف' },},
    /* ---------------------------------- DATE ---------------------------------- */
    // {state: 'start_at',type: 'date',title: 'تاریخ شروع کد تخفیف',options: { keyboard: 'number', isMandatory: true, convertToText: true },},
    /* --------------------------------- SELECT --------------------------------- */
    // {state: 'category_id',type: 'select',title: t('CATEGORY'),selectItems: parentCategories,options: { isMandatory: true },},
    /* ------------------------------ MULTI SELECT ------------------------------ */
    // {state: 'tag_ids',type: 'multiSelect',title: 'تگ ها',selectItems: tags,options: {},},
    /* -------------------------------- TEXT AREA ------------------------------- */
    // {state: 'description',type: 'textarea',title: t('DESCRIPTION'),options: { keyboard: 'text', maxLength: 300 },},
    /* ----------------------------------- MAP ---------------------------------- */
    // {state: 'coordinate',type: 'map',title: ('COORDINATE'),options: { isMandatory: true },},
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
    model: 'propertyReport',
    modelTitle: 'گزارش',
    columns: [
      {
        id: 8,
        title: 'گزارش دهنده',
        key: 'user',
        cellType: 'object',
        nestedKey: 'full_name',
        link: '/users/show',
      },
      {
        id: 9,
        title: 'موبایل گزارش دهنده',
        key: 'user',
        cellType: 'object',
        nestedKey: 'mobile_number',
      },
      { id: 10, title: 'عنوان', key: 'title', cellType: 'string' },
      { id: 20, title: 'توضیحات', key: 'description', cellType: 'string' },
      {
        id: 70,
        title: 'کد ملک',
        key: 'property',
        cellType: 'object',
        nestedKey: 'code',
      },
      {
        id: 71,
        title: 'عنوان ملک',
        key: 'property',
        cellType: 'object',
        nestedKey: 'title',
        link: '/properties/show',
      },
      {
        id: 80,
        title: 'بررسی شده',
        key: 'seen_by_admin',
        cellType: 'boolean',
        isEditable: true,
        editableList: [
          { id: 1, title: 'بررسی نشده', key: 1 },
          { id: 2, title: 'بررسی شده', key: 2 },
        ],
      },

      // { id: 10, title: t('IMAGE'), key: 'image', cellType: 'image' },
      // { id: 30, title: 'کد تخفیف', key: 'code', cellType: 'string' },
      // { id: 40, title: 'تاریخ شروع', key: 'start_at', cellType: 'date' },

      /* ---------------------------------- enum ---------------------------------- */
      // {id: 25,title: t('CATEGORY'),key: items.category_key,cellType: 'enum',enumList: ParentCategoriesList,},
      // { id: 26, title: 'نوع', key: items.type, cellType: 'enum', enumList: BusinessTypeList },

      /* ---------------------------------- date ---------------------------------- */
      { id: 90, title: 'تاریخ ثبت', key: 'created_at', cellType: 'dateTime' },
      // { id: 100, title: t('UPDATED_AT'), key: 'updated_at', cellType: 'date' },
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
      state: 'seen_by_admin',
      title: 'فیلتر براساس وضعیت',
      type: 'select',
      selectItems: [
        { id: 1, title: 'بررسی نشده', key: 1 },
        { id: 2, title: 'بررسی شده', key: 2 },
      ],
    },
    {
      state: 'property_code',
      title: 'کد ملک',
      type: 'input',
    },
    {
      state: 'property_title',
      title: 'عنوان ملک',
      type: 'input',
    },
    {
      state: 'user_mobile',
      title: 'شماره گزارش دهنده',
      type: 'input',
    },
    {
      state: 'property_id',
      title: '',
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
    if (act === 'submit' && rbac.u) availableActions.push('submit');
  }

  return availableActions;
};
