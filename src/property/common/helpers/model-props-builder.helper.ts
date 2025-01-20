import { AccessControlList, Property, Prisma } from '@prisma/client';
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
import { PropertyStatusesList } from '../types/property-status.type';

/* -------------------------------------------------------------------------- */
/*                                    TYPES                                   */
/* -------------------------------------------------------------------------- */
enum RefEnum {
  feature_image = 'feature_image',
  province = 'province',
  city = 'city',
  remaining_days = 'remaining_days',
  status_number = 'status_number',
}
type ModelFields = keyof typeof RefEnum | keyof typeof Prisma.PropertyScalarFieldEnum;
type ModifiedFilterProps = CreateProps & { isHidden?: boolean };
type ModifiedColumn = Column & { key: ModelFields };
type ModifiedTableProps = TableProps & { columns: ModifiedColumn[] };

/* -------------------------------------------------------------------------- */
/*                                    SHOW                                    */
/* -------------------------------------------------------------------------- */
export const showPropsBuilder = (item: Property): Array<ShowProps> => {
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
export const showActionBuilder = (item: Property): Array<ShowAction> => {
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
    model: 'property',
    modelTitle: 'ملک',
    columns: [
      { id: 1, title: 'ردیف', key: 'id', cellType: 'number' },
      { id: 5, title: 'تصویر', key: 'feature_image', cellType: 'image' },
      { id: 10, title: 'عنوان', key: 'title', cellType: 'string' },
      { id: 15, title: 'کد', key: 'code', cellType: 'string', optionalClass: 'text-warning' },
      { id: 20, title: 'شهر', key: 'province', cellType: 'string' },
      { id: 25, title: 'استان', key: 'city', cellType: 'string' },
      { id: 30, title: 'وضعیت', key: 'status_number', cellType: 'enum', enumList: PropertyStatusesList },
      { id: 35, title: 'تاریخ ثبت ملک', key: 'created_at', cellType: 'dateTime' },
      { id: 40, title: 'وضعیت احراز', key: 'is_authorized', cellType: 'boolean' },
      { id: 45, title: 'دارای تیک آبی', key: 'has_blue_tick', cellType: 'boolean' },
      {
        id: 50,
        title: 'باقیمانده اشتراک (روز)',
        key: 'remaining_days',
        cellType: 'number',
        optionalClass: 'text-success',
      },
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
    { title: 'کد', state: 'code', type: 'input' },
    { type: 'break' },
    { title: 'منقضی شده', state: 'expired', type: 'switch' },
    { title: 'احراز شده', state: 'authorized', type: 'switch' },
    /*  */
    { title: 'وضیعت', state: 'status', type: 'select', isHidden: true },
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
