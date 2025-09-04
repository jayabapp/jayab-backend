import {
  AccessControlList,
  Attachment,
  Content,
  ContentAttachment,
  ContentCategory,
  ContentQuestion,
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
  content = 'content',
  content_category = 'content_category',
}
type ModelFields = keyof typeof RefEnum | keyof typeof Prisma.ContentQuestionScalarFieldEnum;
type ModifiedFilterProps = CreateProps & { isHidden?: boolean };
type ModifiedColumn = Column & { key: ModelFields };
type ModifiedTableProps = TableProps & { columns: ModifiedColumn[] };

/* -------------------------------------------------------------------------- */
/*                                    SHOW                                    */
/* -------------------------------------------------------------------------- */
export const showPropsBuilder = (
  item: ContentQuestion & {
    image: Attachment;
    content?: Content;
    content_category?: ContentCategory;
  },
): Array<ShowProps> => {
  const props: Array<ShowProps> = [
    {
      state: 'is_publish',
      type: 'boolean',
      title: 'منتشر شده',
      value: item.is_publish,
    },
    { type: 'break' },
    {
      state: 'content',
      type: 'object',
      title: 'محتوا',
      nestedKey: 'title',
      value: item.content,
    },
    {
      state: 'content_id',
      type: 'string',
      ref: 'content',
      title: '',
      value: item.content_id,
      isHidden: true,
      // isEditable: false,
    },
    { type: 'break' },
    {
      state: 'content_category',
      type: 'object',
      title: 'دسته بندی محتوا',
      nestedKey: 'title',
      value: item.content_category,
    },
    {
      state: 'content_category_id',
      type: 'string',
      ref: 'content_category',
      title: '',
      value: item.content_category_id,
      isHidden: true,
      // isEditable: false,
    },
    { type: 'break' },
    {
      state: 'question',
      type: 'string',
      title: 'پرسش',
      value: item.question,
    },
    { type: 'break' },
    {
      state: 'answer',
      type: 'string',
      title: 'پاسخ',
      value: item.answer,
    },
    { type: 'break' },
    {
      state: 'rate',
      type: 'string',
      title: 'امتیاز',
      value: item.rate,
    },
    {
      state: 'author_name',
      type: 'string',
      title: 'نام',
      value: item.author_name,
    },
    {
      state: 'mobile_number',
      type: 'string',
      title: 'موبایل کاربر',
      value: item.mobile_number,
    },
    { type: 'divider' },
    {
      state: 'image',
      type: 'image',
      title: 'تصویر',
      value: item.image,
      isEditable: false,
    },
    {
      state: 'image_id',
      ref: 'image',
      type: 'image',
      title: 'تصویر',
      value: item.image,
      isHidden: true,
    },
  ];

  return props;
};

/* --------------------------------- ACTIONS -------------------------------- */
export const showActionBuilder = (
  item: ContentQuestion & {
    image: Attachment;
    content: Content;
  },
): Array<ShowAction> => {
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
export const createPropsBuilder = (contents: any, formattedCategories: any): Array<CreateProps> => {
  const createProps: Array<CreateProps> = [
    // { type: 'dividerTitle', title: 'محتوا یا دسته بندی' },
    {
      state: 'content_id',
      type: 'select',
      title: 'محتوا',
      selectItems: contents,
      searchColumn: 'title',
      searchRoute: '/admin/contents',
      options: { isMandatory: false, hint: 'محتوای مرتبط به این پرسش', disabled: true },
    },
    {
      state: 'content_category_id',
      type: 'select',
      title: 'دسته بندی محتوا',
      selectItems: formattedCategories,
      searchColumn: 'title',
      searchRoute: '/admin/content-categories',
      options: { isMandatory: false, hint: 'دسته بندی مرتبط به این پرسش', disabled: true },
    },
    // {
    //   state: 'product_id',
    //   type: 'select',
    //   title: 'محصول',
    //   searchColumn: 'title',
    //   searchRoute: '/admin/products',
    //   options: { isMandatory: false, hint: 'محصول مرتبط به این پرسش', disabled: true },
    // },
    { type: 'divider' },
    {
      state: 'question',
      type: 'textarea',
      title: 'پرسش',
      options: { maxLength: 1000, isMandatory: true, placeholder: 'سوال را وارد نمایید', keyboard: 'text' },
    },
    {
      state: 'answer',
      type: 'textarea',
      title: 'پاسخ',
      options: {
        maxLength: 1000,
        isMandatory: false,
        placeholder: 'پاسخ را وارد نمایید',
        keyboard: 'text',
      },
    },
    { type: 'break' },
    {
      state: 'rate',
      type: 'input',
      title: 'امتیاز',
      options: { titleHint: 'اختیاری', placeholder: 'امتیاز', keyboard: 'number' },
    },
    {
      state: 'author_name',
      type: 'input',
      title: 'نام',
      options: { titleHint: 'اختیاری', placeholder: 'نام پرسش کننده', keyboard: 'text' },
    },
    {
      state: 'is_publish',
      type: 'switch',
      title: 'منتشر شده',
      options: { initValue: true },
    },
    { type: 'divider' },
    {
      state: 'image_id',
      type: 'image',
      title: 'تصویر',
      options: { isMandatory: false, titleHint: 'تصویر اختیاری' },
    },
  ];

  return createProps;
};

/* -------------------------------------------------------------------------- */
/*                                    TABLE                                   */
/* -------------------------------------------------------------------------- */
export const tablePropsBuilder = (availableActions: Array<AvailableAction>): ModifiedTableProps => {
  const tableProps: ModifiedTableProps = {
    model: 'contentQuestion',
    modelTitle: 'پرسش و پاسخ',
    columns: [
      // { id: 5, title: 'تصویر', key: 'image', cellType: 'image' },
      { id: 10, title: 'سوال', key: 'question', cellType: 'string' },
      { id: 20, title: 'پاسخ', key: 'answer', cellType: 'string' },
      { id: 223, title: 'منتشر شده', key: 'is_publish', cellType: 'boolean' },
      { id: 21, title: 'موبایل کاربر', key: 'mobile_number', cellType: 'string' },
      { id: 22, title: 'توسط ادمین', key: 'admin_id', cellType: 'boolean' },
      {
        id: 25,
        title: 'محتوا',
        key: 'content',
        cellType: 'object',
        nestedKey: 'title',
        link: '/contents/edit',
      },
      // {
      //   id: 252,
      //   title: 'دسته بندی',
      //   key: 'content_category',
      //   cellType: 'object',
      //   nestedKey: 'title',
      //   link: '/content_categories/edit',
      // },
      { id: 90, title: 'تاریخ به روز رسانی', key: 'updated_at', cellType: 'date', optionalClass: '!text-xs' },
      { id: 100, title: 'تاریخ ایجاد', key: 'created_at', cellType: 'date', optionalClass: '!text-xs' },
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
    {
      title: 'پرسش',
      state: 'question',
      type: 'input',
    },
    {
      title: 'بدون پاسخ',
      state: 'not_answered',
      type: 'switch',
    },
    {
      title: 'منتشر نشده',
      state: 'is_not_published',
      type: 'switch',
    },
    {
      title: 'محتوا',
      state: 'content_id',
      type: 'select',
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
    if (act == 'create' && rbac.c) availableActions.push('create');
    if (act == 'show' && rbac.r) availableActions.push('show');
    if (act == 'edit' && rbac.u) availableActions.push('edit');
    if (act == 'delete' && rbac.d) availableActions.push('delete');
    // if (act == 'submit' && rbac.u) availableActions.push('submit');
  }

  return availableActions;
};
