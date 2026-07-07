import { AccessControlList, Prisma, PropertyPhotoUpgradeRequest } from '@prisma/client';
import {
  AvailableAction,
  Column,
  CreateProps,
  ShowAction,
  ShowProps,
  TableProps,
} from 'src/common/interfaces/model-props.interface';
import {
  PropertyPhotoUpgradeRequestStatusesList,
  PropertyPhotoUpgradeRequestItemStatusesList,
} from 'src/property/common/types/property-photo-upgrade-status.type';

enum RefEnum {
  property = 'property',
  owner = 'owner',
  payment = 'payment',
  subscription = 'subscription',
  items = 'items',
}
type ModelFields = keyof typeof RefEnum | keyof typeof Prisma.PropertyPhotoUpgradeRequestScalarFieldEnum;
type ModifiedFilterProps = CreateProps & { isHidden?: boolean };
type ModifiedColumn = Column & { key: ModelFields };
type ModifiedTableProps = TableProps & { columns: ModifiedColumn[] };

export const showPropsBuilder = (
  item: PropertyPhotoUpgradeRequest & { items?: unknown[] },
): Array<ShowProps> => {
  const props: Array<ShowProps> = [
    {
      state: 'status',
      title: 'وضعیت درخواست',
      value: PropertyPhotoUpgradeRequestStatusesList.find((e) => e.id === item.status),
      type: 'chip',
    },
    { state: 'image_count', title: 'تعداد تصاویر', value: item.image_count, type: 'number' },
    { state: 'price_per_image', title: 'قیمت هر تصویر', value: item.price_per_image, type: 'number' },
    { state: 'total_amount', title: 'مبلغ کل', value: item.total_amount, type: 'number' },
    { state: 'created_at', title: 'تاریخ ثبت', value: item.created_at, type: 'date' },
    { state: 'completed_at', title: 'تاریخ تکمیل', value: item.completed_at, type: 'date' },
    { type: 'break' },
    { state: 'items', title: 'تصاویر درخواست', value: item.items || [], type: 'image' },
  ];

  return props;
};

export const showActionBuilder = (item: PropertyPhotoUpgradeRequest): Array<ShowAction> => {
  const actions: Array<ShowAction> = [
    {
      title: 'مشاهده ملک',
      route: `/properties/show/${item.property_id}`,
    },
  ];

  return actions;
};

export const createPropsBuilder = (): Array<CreateProps> => {
  return [];
};

export const tablePropsBuilder = (availableActions: Array<AvailableAction>): ModifiedTableProps => {
  const tableProps: ModifiedTableProps = {
    model: 'propertyPhotoUpgradeRequest',
    modelTitle: 'درخواست ارتقا تصاویر',
    columns: [
      {
        id: 20,
        title: 'وضعیت',
        key: 'status',
        cellType: 'enum',
        enumList: PropertyPhotoUpgradeRequestStatusesList,
      },
      {
        id: 30,
        title: 'کد ملک',
        key: 'property',
        cellType: 'object',
        nestedKey: 'code',
        link: '/properties/show',
      },
      {
        id: 40,
        title: 'عنوان ملک',
        key: 'property',
        cellType: 'object',
        nestedKey: 'title',
        link: '/properties/show',
      },
      {
        id: 50,
        title: 'مالک',
        key: 'owner',
        cellType: 'object',
        nestedKey: 'full_name',
        link: '/owners/show',
      },
      {
        id: 60,
        title: 'موبایل مالک',
        key: 'owner',
        cellType: 'object',
        nestedKey: 'mobile_number',
      },
      { id: 70, title: 'تعداد تصاویر', key: 'image_count', cellType: 'number' },
      { id: 80, title: 'قیمت هر تصویر', key: 'price_per_image', cellType: 'number' },
      { id: 90, title: 'مبلغ کل', key: 'total_amount', cellType: 'number' },
      { id: 100, title: 'تاریخ ثبت', key: 'created_at', cellType: 'dateTime' },
      { id: 110, title: 'تاریخ تکمیل', key: 'completed_at', cellType: 'dateTime' },
    ],
    availableActions,
  };

  return tableProps;
};

export const filterPropsBuilder = (): ModifiedFilterProps[] => {
  const filterProps: Array<ModifiedFilterProps> = [
    {
      state: 'status',
      title: 'وضعیت درخواست',
      type: 'select',
      selectItems: PropertyPhotoUpgradeRequestStatusesList,
    },
    {
      state: 'property_code',
      title: 'کد ملک',
      type: 'input',
    },
    {
      state: 'owner_mobile_number',
      title: 'شماره موبایل مالک',
      type: 'input',
    },
    {
      state: 'property_id',
      title: '',
      type: 'input',
      isHidden: true,
    },
    {
      state: 'owner_id',
      title: '',
      type: 'input',
      isHidden: true,
    },
  ];

  return filterProps;
};

export const photoUpgradeRequestItemEditableList = PropertyPhotoUpgradeRequestItemStatusesList.map(
  (item) => ({
    id: item.id,
    title: item.title,
    key: item.id,
  }),
);

export const allActionsBuilder = (rbac: AccessControlList): Array<AvailableAction> => {
  const availableActions: Array<AvailableAction> = [];

  if (rbac.r) availableActions.push('show');

  return availableActions;
};
