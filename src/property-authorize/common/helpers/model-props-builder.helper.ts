import { AccessControlList, PropertyAuthorize, Prisma, Attachment, Property } from '@prisma/client';
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
import { PropertyAuthorizeStatusesList } from '../property-authorize-status.type';

/* -------------------------------------------------------------------------- */
/*                                    TYPES                                   */
/* -------------------------------------------------------------------------- */
enum RefEnum {
  property = 'property',
}
type ModelFields = keyof typeof RefEnum | keyof typeof Prisma.PropertyAuthorizeScalarFieldEnum;
type ModifiedFilterProps = CreateProps & { isHidden?: boolean };
type ModifiedColumn = Column & { key: ModelFields };
type ModifiedTableProps = TableProps & { columns: ModifiedColumn[] };

/* -------------------------------------------------------------------------- */
/*                                    SHOW                                    */
/* -------------------------------------------------------------------------- */
export const showPropsBuilder = (
  item: PropertyAuthorize & { property: Property; nc_image: Attachment; docs: Attachment[] },
): Array<ShowProps> => {
  const props: Array<ShowProps> = [
    { state: 'id', title: 'شناسه', value: item.id, type: 'number', isEditable: false },
    { state: 'title', title: 'ملک', value: item.property.title, type: 'string', route: '/properties/show/' },
    {
      state: 'status',
      title: 'وضعیت',
      value: PropertyAuthorizeStatusesList.find((e) => e.id === item.status),
      type: 'chip',
    },
    {
      state: 'status_list',
      title: 'وضعیت',
      value: PropertyAuthorizeStatusesList,
      isHidden: true,
    },
    {
      state: 'admin_descriptions',
      title: '',
      value: item.changelog,
      isHidden: true,
    },
    { state: 'created_at', title: 'تاریخ ایجاد', value: item.created_at, type: 'date' },
    { state: 'updated_at', title: 'تاریخ به روز رسانی', value: item.created_at, type: 'date' },

    { type: 'divider' },
    { state: 'nc_image', title: 'تصویر کارت ملی', value: item.nc_image, type: 'image' },
    { type: 'divider' },
    { state: 'docs', title: 'مستندات', value: item.docs, type: 'image' },
  ];

  return props;
};

/* --------------------------------- ACTIONS -------------------------------- */
export const showActionBuilder = (item: PropertyAuthorize): Array<ShowAction> => {
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
    model: 'PropertyAuthorize',
    modelTitle: 'احراز ملک',
    columns: [
      { id: 1, title: 'ردیف', key: 'id', cellType: 'number' },
      {
        id: 10,
        title: 'ملک',
        key: 'property',
        cellType: 'object',
        nestedKey: 'title',
        link: '/properties/show/',
      },
      { id: 20, title: 'وضعیت', key: 'status', cellType: 'enum', enumList: PropertyAuthorizeStatusesList },
      // { id: 30, title: 'کد تخفیف', key: 'code', cellType: 'string' },
      // { id: 40, title: 'تاریخ شروع', key: 'start_at', cellType: 'date' },

      /* ---------------------------------- enum ---------------------------------- */
      // {id: 25,title: 'دسته بندی',key: items.category_key,cellType: 'enum',enumList: ParentCategoriesList,},
      // { id: 26, title: 'نوع', key: items.type, cellType: 'enum', enumList: BusinessTypeList },

      /* ---------------------------------- date ---------------------------------- */
      { id: 90, title: 'تاریخ ایجاد', key: 'created_at', cellType: 'dateTime' },
      { id: 100, title: 'تاریخ به روزرسانی', key: 'updated_at', cellType: 'dateTime' },
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
      title: '',
      state: 'status',
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
    // if (act === 'submit' && rbac.u) availableActions.push('submit');
  }

  return availableActions;
};
