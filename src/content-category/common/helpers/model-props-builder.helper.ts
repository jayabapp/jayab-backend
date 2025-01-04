import {
  AccessControlList,
  Attachment,
  Content,
  ContentAttachment,
  ContentCategory,
  Prisma,
} from '@prisma/client';
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
  image = 'image',
  parent = 'parent',
}
type ModelFields = keyof typeof RefEnum | keyof typeof Prisma.ContentScalarFieldEnum;
type ModifiedFilterProps = CreateProps & { isHidden?: boolean };
type ModifiedColumn = Column & { key: ModelFields };
type ModifiedTableProps = TableProps & { columns: ModifiedColumn[] };

/* -------------------------------------------------------------------------- */
/*                                    SHOW                                    */
/* -------------------------------------------------------------------------- */
export const showPropsBuilder = (
  item: ContentCategory & {
    image: Attachment;
    parent: ContentCategory;
  },
): Array<ShowProps> => {
  const props: Array<ShowProps> = [
    {
      state: 'title',
      title: 'عنوان',
      value: item.title,
      type: 'string',
    },
    {
      state: 'key',
      title: 'کلید',
      value: item.key,
      type: 'string',
    },
    {
      state: 'parent',
      title: 'دسته بندی والد',
      value: item.parent,
      nestedKey: 'title',
      type: 'object',
    },
    {
      state: 'parent_id',
      ref: 'parent',
      title: '',
      value: item.parent_id,
      type: 'string',
      isHidden: true,
    },
    {
      state: 'show_in_sitemap',
      title: 'نمایش در سایت مپ',
      value: item.show_in_sitemap,
      type: 'boolean',
    },
    {
      state: 'description',
      title: 'توضیحات',
      value: item.description,
      type: 'longString',
    },
    { type: 'divider' },
    {
      state: 'image',
      title: 'تصویر دسته بندی',
      value: item.image,
      type: 'image',
    },
    {
      state: 'image_id',
      ref: 'image',
      title: '',
      value: item.image_id,
      type: 'image',
      isHidden: true,
    },
    {
      state: 'dynamic_fields',
      title: 'فیلدهای اضافی',
      value: item.dynamic_fields,
      type: 'list',
    },
    {
      state: 'seo',
      title: '',
      value: item.seo,
      type: 'object',
      isHidden: true,
    },
    { type: 'divider' },
    {
      state: 'html',
      title: 'html',
      value: item.html,
      type: 'html',
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
export const createPropsBuilder = (formattedCategories: any): Array<CreateProps> => {
  const createProps: Array<CreateProps> = [
    {
      state: 'title',
      type: 'input',
      title: 'عنوان',
      options: { maxLength: 100, isMandatory: true, placeholder: 'مثلا: درباره ما', keyboard: 'text' },
    },
    {
      state: 'key',
      type: 'input',
      title: 'کلید',
      options: {
        maxLength: 50,
        isMandatory: true,
        placeholder: 'ex: aboutUs',
        keyboard: 'text',
        hint: 'کاراکترهای قابل قبول: [A-Z]',
        titleHint: 'فقط به انگلیسی و متصل به هم',
      },
    },
    {
      state: 'parent_id',
      type: 'select',
      title: 'دسته بندی والد (اختیاری)',
      selectItems: formattedCategories,
      options: {},
    },
    {
      state: 'show_in_sitemap',
      type: 'switch',
      title: 'نمایش در سایت مپ',
      options: { initValue: true },
    },
    {
      state: 'description',
      type: 'textarea',
      title: 'توضیحات (اختیاری)',
      options: {},
    },
    { type: 'divider' },
    {
      state: 'image_id',
      type: 'image',
      title: 'تصویر دسته بندی',
      options: { titleHint: 'تصویر اختیاری است' },
    },
    { type: 'divider' },
    { state: 'html', type: 'editor', title: '', options: {} },
  ];

  return createProps;
};

/* -------------------------------------------------------------------------- */
/*                                    TABLE                                   */
/* -------------------------------------------------------------------------- */
export const tablePropsBuilder = (availableActions: Array<AvailableAction>): ModifiedTableProps => {
  const tableProps: ModifiedTableProps = {
    model: 'contentCategory',
    modelTitle: 'دسته بندی محتوا',
    columns: [
      { id: 1, title: 'شناسه', key: 'id', cellType: 'number' },
      { id: 2, title: 'تصویر', key: 'image', cellType: 'image' },
      { id: 10, title: 'عنوان', key: 'title', cellType: 'string' },
      { id: 20, title: 'کلید', key: 'key', cellType: 'string' },
      { id: 30, title: 'والد', key: 'parent', cellType: 'object', nestedKey: 'title' },
      { id: 40, title: 'نمایش در سایت مپ', key: 'show_in_sitemap', cellType: 'boolean' },
      /* ---------------------------------- date ---------------------------------- */
      { id: 100, title: 'تاریخ ساخت', key: 'created_at', cellType: 'date' },
    ],
    availableActions,
  };

  return tableProps;
};

/* -------------------------------------------------------------------------- */
/*                                   FILTER                                   */
/* -------------------------------------------------------------------------- */
export const filterPropsBuilder = (keys?: any): ModifiedFilterProps[] => {
  const filterProps: Array<ModifiedFilterProps> = [
    { title: 'عنوان', state: 'title', type: 'input' },
    { title: 'کلید', state: 'key', type: 'input' },
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
