import { AccessControlList, Advisor, Attachment, City, Prisma, User } from '@prisma/client';
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
import { AdvisorStatusList } from '../advisor-status.type';

/* -------------------------------------------------------------------------- */
/*                                    TYPES                                   */
/* -------------------------------------------------------------------------- */
enum RefEnum {
  user = 'user',
  image = 'image',
  sub_remaining_days = 'sub_remaining_days',
  has_sub = 'has_sub',
}
type ModelFields = keyof typeof RefEnum | keyof typeof Prisma.AdvisorScalarFieldEnum;
type ModifiedFilterProps = CreateProps & { isHidden?: boolean };
type ModifiedColumn = Column & { key: ModelFields };
type ModifiedTableProps = TableProps & { columns: ModifiedColumn[] };

/* -------------------------------------------------------------------------- */
/*                                    SHOW                                    */
/* -------------------------------------------------------------------------- */
export const showPropsBuilder = (
  item: Advisor & {
    document_image: Attachment;
    national_card_image: Attachment;
    profile_image: Attachment;
    profile_image_id: number;
    user: User;
    cities: City[];
  },
): Array<ShowProps> => {
  const props: Array<ShowProps> = [
    { state: 'status_list', title: 'لیست وضعیت ها', value: AdvisorStatusList, isHidden: true },
    {
      state: 'admin_descriptions',
      title: 'توضیحات ادمین',
      value: item.admin_descriptions,
      type: 'string',
      isEditable: false,
      isHidden: true,
    },
    { state: 'id', title: 'شناسه', value: item.id, type: 'string' },
    {
      state: 'status',
      title: 'وضعیت',
      value: AdvisorStatusList.find((e) => e.id == item.status),
      type: 'chip',
    },
    {
      state: 'is_special',
      title: 'ویژه',
      value: item.is_special,
      type: 'boolean',
    },
    { type: 'break' },
    {
      state: 'full_name',
      title: 'نام و نام خانوادگی',
      value: item.user.full_name,
      type: 'string',
      // route: `/users/edit/${item.user.id}`,
    },
    {
      state: 'national_code',
      title: 'کد ملی',
      value: item.national_code,
      type: 'string',
    },
    { type: 'break' },
    {
      state: 'mobile_number',
      title: 'موبایل',
      value: item.user.mobile_number,
      type: 'string',
    },
    {
      state: 'tel',
      title: 'شماره تلفن',
      value: item.tel,
      type: 'string',
    },
    // {
    //   state: 'area_code',
    //   title: 'پیش شماره',
    //   value: item.area_code,
    //   type: 'string',
    // },
    { type: 'break' },
    {
      state: 'cityIds',
      value: item.cities,
      isHidden: true,
    },
    {
      state: 'cities_title',
      title: 'شهر های حوزه فعالیت',
      value: item.cities.map((e) => e.title).join(' - '),
      type: 'longString',
    },
    { type: 'break' },
    {
      state: 'address',
      title: 'آدرس',
      value: item.address,
      type: 'longString',
    },
    { type: 'break' },
    { state: 'created_at', title: 'تاریخ ثبت نام', value: item.created_at, type: 'date' },
    { state: 'updated_at', title: 'تاریخ به روز رسانی', value: item.updated_at, type: 'date' },
    /* -------------------------------------------------------------------------- */

    { type: 'divider' },
    { state: 'profile_image', title: 'تصویر پروفایل', value: item.profile_image, type: 'image' },
    {
      state: 'profile_image_id',
      ref: 'profile_image',
      value: item.profile_image_id,
      isHidden: true,
    },
    { state: 'document_image', title: 'تصویر مدارک', value: item.document_image, type: 'image' },
    {
      state: 'document_image_id',
      ref: 'document_image',
      value: item.document_image_id,
      isHidden: true,
    },
    { state: 'national_card_image', title: 'تصویر کارت ملی', value: item.national_card_image, type: 'image' },
    {
      state: 'national_card_image_id',
      ref: 'national_card_image',
      value: item.national_card_image_id,
      isHidden: true,
    },
  ];

  return props;
};

/* --------------------------------- ACTIONS -------------------------------- */
export const showActionBuilder = (item: Advisor): Array<ShowAction> => {
  const actions: Array<ShowAction> = [
    {
      title: 'اشتراک های خریداری شده',
      route: `/subscriptions/create?advisor_id=${item.id}`,
    },
  ];

  return actions;
};

/* -------------------------------------------------------------------------- */
/*                                   CREATE                                   */
/* -------------------------------------------------------------------------- */
export const createPropsBuilder = (): Array<CreateProps> => {
  const createProps: Array<CreateProps> = [
    {
      state: 'is_special',
      type: 'switch',
      title: 'ویژه',
      options: { isMandatory: true },
    },
    { type: 'divider' },
    {
      state: 'full_name',
      type: 'input',
      title: 'نام و نام خانوادگی',
      options: { maxLength: 128, isMandatory: true, placeholder: 'علی کاظمی' },
    },
    {
      state: 'national_code',
      type: 'input',
      title: 'کد ملی',
      options: { maxLength: 10, isMandatory: true },
    },
    { type: 'divider' },
    {
      state: 'mobile_number',
      type: 'input',
      title: 'موبایل',
      options: { maxLength: 11, isMandatory: true, placeholder: '۰۹۱۲۱۲۳۴۵۶۷' },
    },
    {
      state: 'tel',
      type: 'input',
      title: 'شماره تلفن',
      options: { maxLength: 11, isMandatory: true, placeholder: '۰۲۱۱۲۳۴۵۶۷۸' },
    },
    { type: 'divider' },
    {
      state: 'cityIds',
      type: 'multiSelect',
      title: 'شهر های حوزه فعالیت',
      options: { isMandatory: true },
      searchRoute: '/admin/cities',
      searchColumn: 'is_parent=0',
    },
    { type: 'divider' },
    {
      state: 'address',
      type: 'input',
      title: 'آدرس',
      options: { maxLength: 1024, isMandatory: true, placeholder: 'تهران، ...' },
    },
    { type: 'divider' },
    {
      state: 'profile_image_id',
      type: 'image',
      title: 'تصویر پروفایل',
      options: { isMandatory: true, titleHint: 'تنها یک عکس میتوانید آپلود کنید' },
    },
    {
      state: 'document_image_id',
      type: 'image',
      title: 'تصویر مدارک',
      options: { isMandatory: true, titleHint: 'تنها یک عکس میتوانید آپلود کنید' },
    },
    {
      state: 'national_card_image_id',
      type: 'image',
      title: 'تصویر کارت ملی',
      options: { isMandatory: true, titleHint: 'تنها یک عکس میتوانید آپلود کنید' },
    },
  ];

  return createProps;
};

/* -------------------------------------------------------------------------- */
/*                                    TABLE                                   */
/* -------------------------------------------------------------------------- */
export const tablePropsBuilder = (availableActions: Array<AvailableAction>): ModifiedTableProps => {
  const tableProps: ModifiedTableProps = {
    model: 'advisor',
    modelTitle: 'مشاور',
    columns: [
      { id: 1, title: 'ردیف', key: 'id', cellType: 'number' },
      { id: 10, title: 'تصویر', key: 'user', cellType: 'image', nestedKey: 'image' },
      { id: 20, title: 'نام و نام خانوادگی', key: 'user', cellType: 'object', nestedKey: 'full_name' },
      { id: 30, title: 'موبایل', key: 'user', cellType: 'object', nestedKey: 'mobile_number' },
      { id: 31, title: 'رضایت کاربران', key: 'users_satisfaction', cellType: 'number' },
      { id: 32, title: 'رضایت مالکان', key: 'owners_satisfaction', cellType: 'number' },
      { id: 50, title: 'ویژه', key: 'is_special', cellType: 'boolean' },
      { id: 80, title: 'وضعیت', key: 'status', cellType: 'enum', enumList: AdvisorStatusList },
      { id: 88, title: 'اشتراک فعال', key: 'has_sub', cellType: 'boolean' },
      { id: 89, title: 'روز مانده از اشتراک', key: 'sub_remaining_days', cellType: 'number' },
      // { id: 89, title: 'کد معرفی کننده', key: 'user', cellType: 'object', nestedKey: 'referral_code' },
      { id: 90, title: 'تاریخ ثبت نام', key: 'created_at', cellType: 'dateTime' },
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
    { title: 'شماره موبایل', state: 'mobile_number', type: 'input' },
    { title: 'نام و نام خانوادگی', state: 'full_name', type: 'input' },
    { title: 'اشتراک فعال', state: 'no_sub', type: 'switch' },
    { title: 'مشاور ویژه', state: 'is_special', type: 'switch' },
    { title: '', state: 'status', type: 'select', isHidden: true },
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
    if (act === 'edit' && rbac.u) availableActions.push('edit');
    // if (act === 'delete' && rbac.d) availableActions.push('delete');
    // if (act === 'submit' && rbac.u) availableActions.push('submit');
  }

  return availableActions;
};
