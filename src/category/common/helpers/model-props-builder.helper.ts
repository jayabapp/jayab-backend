import { AccessControlList, Prisma, Category, Attachment } from '@prisma/client';
import { AttachmentAdminFolder } from 'src/attachment/interfaces/attachment-folder.enum';
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
  product = 'product',
  user = 'user',
  updated_status = 'updated_status',
}
type ModelFields = keyof typeof RefEnum | keyof typeof Prisma.CategoryScalarFieldEnum;
type ModifiedFilterProps = FilterProps;
type ModifiedColumn = Column & { key: ModelFields };
type ModifiedTableProps = TableProps & { columns: ModifiedColumn[] };

/* -------------------------------------------------------------------------- */
/*                                    SHOW                                    */
/* -------------------------------------------------------------------------- */
export const showPropsBuilder = (item: Category & { image: Attachment }): Array<ShowProps> => {
  const props: Array<ShowProps> = [
    {
      state: 'id',
      title: 'شناسه',
      value: item.id,
      type: 'number',
      isEditable: false,
    },
    {
      state: 'sort_order',
      title: 'ترتیب نمایش',
      value: item.sort_order,
      type: 'number',
    },
    {
      state: 'parent_id',
      value: item.parent_id,
      type: 'number',
      isEditable: false,
      isHidden: true,
    },
    {
      state: 'title',
      title: 'عنوان',
      value: item.title,
      type: 'string',
    },
    { type: 'break' },
    {
      state: 'is_active',
      type: 'boolean',
      value: item.is_active,
      title: 'فعال',
    },
    {
      state: 'is_feature_category',
      type: 'boolean',
      value: item.is_feature_category,
      title: 'دسته بندی شاخص',
    },
    {
      state: 'hex_color',
      type: 'color',
      value: item.hex_color,
      title: 'رنگ',
    },
    {
      state: 'created_at',
      title: 'ایجاد شده در',
      value: item.created_at,
      type: 'date',
    },
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
  ];

  return props;
};

/* --------------------------------- ACTIONS -------------------------------- */
export const showActionBuilder = (item: any): Array<ShowAction> => {
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
      options: { maxLength: 100, isMandatory: true, placeholder: 'نان سنتی', keyboard: 'text' },
    },
    {
      state: 'sort_order',
      type: 'input',
      title: 'ترتیب نمایش',
      options: { keyboard: 'number', isMandatory: false, titleHint: 'اختیاری' },
    },
    {
      state: 'hex_color',
      type: 'colorInput',
      title: 'رنگ',
      options: { isMandatory: false, titleHint: 'اختیاری' },
    },
    { type: 'break' },
    {
      state: 'is_active',
      type: 'switch',
      title: 'فعال',
      options: { isMandatory: true },
    },
    {
      state: 'is_feature_category',
      type: 'switch',
      title: 'دسته بندی شاخص',
      options: { isMandatory: false },
    },
    {
      state: 'image_id',
      type: 'image',
      title: 'تصویر اصلی',
      options: {
        isMandatory: true,
        titleHint: 'تنها یک عکس میتوانید آپلود کنید',
        imageType: AttachmentAdminFolder.CATEGORY,
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
    model: 'category',
    modelTitle: 'دسته بندی',
    columns: [],
    availableActions,
  };

  return tableProps;
};

/* -------------------------------------------------------------------------- */
/*                                   FILTER                                   */
/* -------------------------------------------------------------------------- */
export const filterPropsBuilder = (): ModifiedFilterProps[] => {
  const filterProps: Array<ModifiedFilterProps> = [
    { id: 1, title: 'شناسه', key: 'id', type: 'number', operators: [operators.equals] },
    { id: 10, title: 'نام', key: 'title', type: 'string', operators: [operators.contains] },
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
