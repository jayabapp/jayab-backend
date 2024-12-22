import { AccessControlList, Attachment, Prisma, Banner, Category } from '@prisma/client';
import { AttachmentAdminFolder } from 'src/attachment/interfaces/attachment-folder.enum';
import {
  AvailableAction,
  Column,
  CreateProps,
  ShowAction,
  ShowProps,
  TableProps,
} from 'src/common/interfaces/model-props.interface';
import { BannerPositionList } from '../banner-positions.constant';

/* -------------------------------------------------------------------------- */
/*                                    TYPES                                   */
/* -------------------------------------------------------------------------- */
enum RefEnum {
  image = 'image',
  image_sm = 'image_sm',
}
type ModelFields = keyof typeof RefEnum | keyof typeof Prisma.BannerScalarFieldEnum;
type ModifiedFilterProps = CreateProps & { isHidden?: boolean };
type ModifiedColumn = Column & { key: ModelFields };
type ModifiedTableProps = TableProps & { columns: ModifiedColumn[] };

/* -------------------------------------------------------------------------- */
/*                                    SHOW                                    */
/* -------------------------------------------------------------------------- */
export const showPropsBuilder = (
  item: Banner & {
    category: Category;
    image: Attachment;
    image_sm: Attachment;
  },
): Array<ShowProps> => {
  const props: Array<ShowProps> = [
    { state: 'title', title: 'عنوان', value: item.title, type: 'string' },
    { state: 'is_active', title: 'فعال', value: item.is_active, type: 'boolean' },
    {
      state: 'positionList',
      title: 'موقعیت',
      value: BannerPositionList.find((e) => e.id == item.position),
      type: 'chip',
    },
    {
      state: 'position',
      title: 'موقعیت',
      value: item.position,
      type: 'string',
      ref: 'positionList',
      isHidden: true,
    },
    { state: 'sort_order', title: 'ترتیب الویت نمایش', value: item.sort_order, type: 'number' },
    { state: 'link', title: 'لینک', value: item.link, type: 'longString' },
    { state: 'description', title: 'توضیحات', value: item.description, type: 'longString' },
    { state: 'category', title: 'دسته بندی', value: item.category, type: 'object', nestedKey: 'title' },
    { type: 'divider' },
    {
      state: 'image',
      title: 'تصویر',
      value: item.image,
      type: 'image',
    },
    {
      state: 'image_id',
      ref: 'image',
      value: item.image_id,
      type: 'image',
      isHidden: true,
    },
    {
      state: 'image_sm',
      title: 'تصویر',
      value: item.image_sm,
      type: 'image',
    },
    {
      state: 'image_sm_id',
      ref: 'image_sm',
      value: item.image_sm_id,
      type: 'image',
      isHidden: true,
    },
  ];

  return props;
};

/* --------------------------------- ACTIONS -------------------------------- */
export const showActionBuilder = (item: Banner): Array<ShowAction> => {
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
      options: { maxLength: 100, isMandatory: true, keyboard: 'text' },
    },
    {
      state: 'position',
      type: 'select',
      title: 'موقعیت نمایشی بنر',
      selectItems: BannerPositionList,
      options: { isMandatory: true },
    },
    {
      state: 'link',
      type: 'input',
      title: 'لینک',
    },
    {
      state: 'sort_order',
      type: 'input',
      title: 'ترتیب الویت نمایش',
      options: { keyboard: 'number' },
    },
    { state: 'is_active', type: 'switch', title: 'فعال', options: { isMandatory: true, initValue: true } },
    { type: 'break' },
    {
      state: 'description',
      type: 'textarea',
      title: 'توضیحات',
    },
    { type: 'divider' },
    {
      state: 'image_id',
      type: 'image',
      title: 'تصویر',
      options: {
        isMandatory: true,
        titleHint: 'تصویر اصلی بنر',
        imageType: AttachmentAdminFolder.BANNER,
      },
    },
    { type: 'divider' },
    {
      state: 'image_sm_id',
      type: 'image',
      title: 'تصویر',
      options: {
        isMandatory: false,
        titleHint: 'تصویر برای سایز موبایل (اختیاری)',
        imageType: AttachmentAdminFolder.BANNER_SM,
      },
    },
  ];

  return createProps;
};

/* -------------------------------------------------------------------------- */
/*                                    TABLE                                   */
/* -------------------------------------------------------------------------- */
export const tablePropsBuilder = (availableActions: Array<AvailableAction>): ModifiedTableProps => {
  const tableProps: ModifiedTableProps = {
    model: 'banner',
    modelTitle: 'بنر',
    columns: [
      { id: 1, title: 'شناسه', key: 'id', cellType: 'number' },
      { id: 5, title: 'تصویر', key: 'image', cellType: 'image' },
      { id: 6, title: 'تصویر سایز کوچک', key: 'image_sm', cellType: 'image' },
      { id: 2, title: 'عنوان', key: 'title', cellType: 'string' },
      { id: 3, title: 'فعال', key: 'is_active', cellType: 'boolean' },
      { id: 4, title: 'ترتیب', key: 'sort_order', cellType: 'string' },
      {
        id: 25,
        title: 'موقعیت',
        key: 'position',
        cellType: 'enum',
        enumList: BannerPositionList,
      },
      /* ---------------------------------- date ---------------------------------- */
      { id: 90, title: 'تاریخ ایجاد', key: 'created_at', cellType: 'date' },
      { id: 100, title: 'تاریخ به روزرسانی', key: 'updated_at', cellType: 'date' },
    ],
    availableActions: availableActions,
  };

  return tableProps;
};

/* -------------------------------------------------------------------------- */
/*                                   FILTER                                   */
/* -------------------------------------------------------------------------- */
export const filterPropsBuilder = (): ModifiedFilterProps[] => {
  const filterProps: Array<ModifiedFilterProps> = [
    { title: 'عنوان', state: 'position', type: 'select', isHidden: true },
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
