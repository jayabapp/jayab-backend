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
  attachment = 'attachment',
  category = 'category',
  video = 'video',
  feature_image = 'feature_image',
  parent_category = 'parent_category',
}
type ModelFields = keyof typeof RefEnum | keyof typeof Prisma.ContentScalarFieldEnum;
type ModifiedFilterProps = CreateProps & { isHidden?: boolean };
type ModifiedColumn = Column & { key: ModelFields };
type ModifiedTableProps = TableProps & { columns: ModifiedColumn[] };

/* -------------------------------------------------------------------------- */
/*                                    SHOW                                    */
/* -------------------------------------------------------------------------- */
export const showPropsBuilder = (
  item: Content & {
    feature_image: Attachment;
    video: Attachment;
    category: ContentCategory;
    attachments: Array<ContentAttachment & { attachment: Attachment }>;
  },
): Array<ShowProps> => {
  const attachments = item.attachments?.map((e) => e.attachment);
  const attachmentIds = attachments?.map((e) => e.id);

  const props: Array<ShowProps> = [
    {
      state: 'category',
      title: 'دسته بندی',
      value: item.category,
      nestedKey: 'title',
      type: 'object',
    },
    {
      state: 'category_id',
      ref: 'category',
      title: '',
      value: item.category_id,
      type: 'string',
      isHidden: true,
    },
    {
      state: 'title',
      title: 'عنوان',
      value: item.title,
      type: 'string',
    },
    {
      state: 'slug',
      title: 'اسـلاگ',
      value: item.slug,
      type: 'string',
    },
    {
      state: 'key',
      title: 'کلید(اختیاری)',
      value: item.key,
      type: 'string',
    },
    {
      state: 'link',
      title: 'لینک',
      value: item.link,
      type: 'string',
    },
    {
      state: 'order',
      title: 'ترتیب نمایش',
      value: item.order,
      type: 'number',
    },
    { type: 'divider' },
    {
      state: 'is_active',
      title: 'فعال',
      value: item.is_active,
      type: 'boolean',
    },
    {
      state: 'show_in_sitemap',
      title: 'نمایش در سایت مپ',
      value: item.show_in_sitemap,
      type: 'boolean',
    },
    {
      state: 'published_at',
      title: 'تاریخ انتشار',
      value: item.published_at,
      type: 'date',
    },
    {
      state: 'created_at',
      title: 'تاریخ ایجاد',
      value: item.created_at,
      type: 'date',
      isEditable: false,
    },
    {
      state: 'updated_at',
      title: 'تاریخ به روزرسانی',
      value: item.updated_at,
      type: 'date',
      isEditable: false,
    },
    {
      type: 'divider',
    },
    {
      state: 'small_text',
      title: 'توضیحات کوتاه',
      value: item.small_text,
      type: 'longString',
    },

    {
      state: 'full_text',
      title: 'توضیحات بلند',
      value: item.full_text,
      type: 'longString',
    },
    {
      type: 'divider',
    },

    /* --------------------------------- images --------------------------------- */

    { state: 'feature_image', title: 'تصویر شاخص', value: item.feature_image, type: 'image' },
    {
      state: 'feature_image_id',
      ref: 'feature_image',
      title: '',
      value: item.feature_image_id,
      type: 'image',
      isHidden: true,
    },
    {
      type: 'divider',
    },
    { state: 'attachments', title: 'عکس های بیشتر', value: attachments, type: 'image' },
    {
      state: 'attachments_ids',
      ref: 'attachments',
      value: attachmentIds || [],
      type: 'image',
      isHidden: true,
    },
    {
      type: 'divider',
    },
    { state: 'video', title: 'ویدیو', value: item.video, type: 'video' },
    {
      state: 'video_id',
      ref: 'video',
      value: item.video_id,
      type: 'video',
      isHidden: true,
    },
    { type: 'divider' },
    { type: 'dividerTitle', title: 'فیلدهای تکمیلی:' },
    {
      state: 'fields',
      title: 'فیلدهای تکمیلی',
      value: item.fields,
      type: 'object',
      isHidden: true,
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
export const showActionBuilder = (item: Content): Array<ShowAction> => {
  const actions: Array<ShowAction> = [
    {
      title: 'فـرم ساز',
      route: `/contents/${item.id}/form-builder`,
    },
    {
      title: 'سوالات',
      route: `content-questions?content_id=${item.id}&page=1`,
    },
  ];

  return actions;
};

/* -------------------------------------------------------------------------- */
/*                                   CREATE                                   */
/* -------------------------------------------------------------------------- */
export const createPropsBuilder = (formattedCategories: any): Array<CreateProps> => {
  const createProps: Array<CreateProps> = [
    {
      state: 'category_id',
      type: 'select',
      title: 'دسته بندی',
      selectItems: formattedCategories,
      options: { isMandatory: true },
    },
    {
      state: 'title',
      type: 'input',
      title: 'عنوان',
      options: { maxLength: 100, isMandatory: true, placeholder: 'مقاله شماره یک', keyboard: 'text' },
    },
    {
      state: 'slug',
      type: 'input',
      title: 'اسـلاگ',
      options: { isMandatory: true, placeholder: 'مقاله_شماره_یک', keyboard: 'text' },
    },
    {
      state: 'key',
      type: 'input',
      title: 'کلید (اختیاری)',
      options: { maxLength: 100, placeholder: 'tel', hint: 'کاراکترهای قابل قبول: A-Z' },
    },
    {
      state: 'order',
      type: 'input',
      title: 'ترتیب نمایش',
      options: { placeholder: '1', hint: 'عدد به انگلیسی وارد شود', keyboard: 'number' },
    },
    {
      state: 'link',
      type: 'input',
      title: 'لینک',
      options: {
        titleHint: 'داخلی یا خارجی',
        hint: 'لینک خارجی به صورت کامل و داخلی به صورت آدرس',
        inputClass: 'text-left',
      },
    },
    { state: 'is_active', type: 'switch', title: 'فعال', options: { initValue: true } },
    { state: 'show_in_sitemap', type: 'switch', title: 'نمایش در سایت مپ', options: { initValue: true } },
    { state: 'published_at', type: 'date', title: 'تاریخ انتشار', options: {} },
    { state: '', type: 'break', title: '', options: {} },
    { state: 'small_text', type: 'textarea', title: 'توضیحات کوتاه', options: {} },
    { state: 'full_text', type: 'textarea', title: 'توضیحات بلند', options: {} },
    { state: 'html', type: 'editor', title: '', options: {} },
    { state: '', type: 'divider', title: '', options: {} },
    {
      state: 'feature_image_id',
      type: 'image',
      title: 'تصویر شاخص',
      options: { isMandatory: true, titleHint: 'تنها یک عکس میتوانید آپلود کنید' },
    },
    { type: 'divider', title: '' },
    {
      state: 'attachments',
      type: 'image',
      title: 'تصایر اضافی',
      options: { isMandatory: false, titleHint: '', multiImage: true },
    },
    { type: 'divider', title: '' },
    {
      state: 'video_id',
      type: 'video',
      title: 'ویدیو',
      options: { isMandatory: false, titleHint: '' },
    },
  ];

  return createProps;
};

/* -------------------------------------------------------------------------- */
/*                                    TABLE                                   */
/* -------------------------------------------------------------------------- */
export const tablePropsBuilder = (availableActions: Array<AvailableAction>): ModifiedTableProps => {
  const tableProps: ModifiedTableProps = {
    model: 'content',
    modelTitle: 'محتوا',
    columns: [
      { id: 5, title: 'تصویر', key: 'feature_image', cellType: 'image' },
      { id: 10, title: 'عنوان', key: 'title', cellType: 'string' },
      { id: 11, title: 'کلید', key: 'key', cellType: 'string' },
      { id: 30, title: 'فعال', key: 'is_active', cellType: 'boolean' },
      { id: 31, title: 'نمایش در سایت مپ', key: 'show_in_sitemap', cellType: 'boolean' },
      { id: 32, title: 'تاریخ  انتشار', key: 'published_at', cellType: 'date' },
      { id: 20, title: 'ترتیب', key: 'order', cellType: 'string' },
      { id: 21, title: 'بازدید', key: 'view_count', cellType: 'string' },
      {
        id: 25,
        title: 'دسته بندی',
        key: 'category',
        cellType: 'object',
        nestedKey: 'title',
      },
      {
        id: 35,
        title: 'دسته بندی والد',
        key: 'parent_category',
        cellType: 'object',
        nestedKey: 'title',
      },
      { id: 100, title: 'تاریخ ساخت', key: 'created_at', cellType: 'date' },
    ],
    availableActions,
  };

  return tableProps;
};

/* -------------------------------------------------------------------------- */
/*                                   FILTER                                   */
/* -------------------------------------------------------------------------- */
export const filterPropsBuilder = (keys: any): ModifiedFilterProps[] => {
  const filterProps: Array<ModifiedFilterProps> = [
    {
      title: 'مرتب سازی',
      state: 'sort_by',
      type: 'select',
      selectItems: [
        { id: 'date_desc', title: 'جدیدترین' },
        { id: 'date_asc', title: 'قدیمی ترین' },
        { id: 'view_desc', title: 'پربازدیدترین' },
        { id: 'view_asc', title: 'کم بازدیدترین' },
      ],
    },
    { title: 'عنوان', state: 'title', type: 'input' },
    {
      title: 'دسته بندی',
      state: 'category_id',
      type: 'select',
      selectItems: keys || [],
    },
    { title: 'توضیحات کوتاه', state: 'small_text', type: 'input' },
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
