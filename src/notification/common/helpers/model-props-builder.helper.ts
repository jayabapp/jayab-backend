import { AccessControlList, Attachment, Owner, Prisma, User } from '@prisma/client';
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
import { NotificationType } from '../notification-type.type';
import { FirebaseTopicType, FirebaseTopicTypeList } from 'src/firebase/constants/topic-types';

/* -------------------------------------------------------------------------- */
/*                                    TYPES                                   */
/* -------------------------------------------------------------------------- */
enum RefEnum {
  user = 'user',
}
type ModelFields = keyof typeof RefEnum | keyof typeof Prisma.NotificationScalarFieldEnum;
type ModifiedFilterProps = CreateProps & { isHidden?: boolean };
type ModifiedColumn = Column & { key: ModelFields };
type ModifiedTableProps = TableProps & { columns: ModifiedColumn[] };

/* -------------------------------------------------------------------------- */
/*                                    SHOW                                    */
/* -------------------------------------------------------------------------- */
export const showPropsBuilder = (
  item: Owner & { user: User & { profile_image: Attachment } },
): Array<ShowProps> => {
  const props: Array<ShowProps> = [];

  return props;
};

/* --------------------------------- ACTIONS -------------------------------- */
export const showActionBuilder = (item: Owner): Array<ShowAction> => {
  const actions: Array<ShowAction> = [
    {
      title: 'املاک',
      route: `/properties?page=1&owner_id=${item.id}`,
    },
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
export const createPropsBuilder = (type: NotificationType): Array<CreateProps> => {
  const createProps: Array<CreateProps> = [];

  if (+type == NotificationType.MOBILE)
    createProps.push({
      state: 'mobile_numbers',
      type: 'textarea',
      title: 'شماره موبایل ها',
      options: {
        maxLength: 4096,
        isMandatory: true,
        placeholder: '09121234567,09127654321',
        keyboard: 'text',
      },
    });
  else
    createProps.push({
      state: 'topic',
      type: 'select',
      title: 'گروه',
      selectItems: FirebaseTopicTypeList,
      options: { isMandatory: true },
    });

  createProps.push(
    { type: 'break' },
    {
      state: 'title',
      type: 'input',
      title: 'عنوان',
      options: { maxLength: 128, isMandatory: true, placeholder: 'سلام', keyboard: 'text' },
    },
    { type: 'break' },
    {
      state: 'body',
      type: 'textarea',
      title: 'متن پیام',
      options: { maxLength: 2048, isMandatory: true, placeholder: 'به جایاب خوش آمدید', keyboard: 'text' },
    },
  );

  return createProps;
};

/* -------------------------------------------------------------------------- */
/*                                    TABLE                                   */
/* -------------------------------------------------------------------------- */
export const tablePropsBuilder = (availableActions: Array<AvailableAction>): ModifiedTableProps => {
  const tableProps: ModifiedTableProps = {
    model: 'notifications',
    modelTitle: 'اعلان',
    columns: [
      { id: 1, title: 'ردیف', key: 'id', cellType: 'number' },
      { id: 2, title: 'عنوان', key: 'title', cellType: 'string' },
      { id: 3, title: 'متن', key: 'body', cellType: 'string', optionalClass: 'text-sm line-clamp-5' },
      { id: 3, title: 'ارسال به موبایل', key: 'data', cellType: 'object', nestedKey: 'mobile_number' },
      { id: 5, title: 'ارسال به گروه', key: 'topic', cellType: 'boolean' },
      { id: 6, title: 'نام گروه', key: 'topic', cellType: 'enum', enumList: FirebaseTopicTypeList },
      { id: 7, title: 'تاریخ ایجاد', key: 'created_at', cellType: 'dateTime' },
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
    // { title: 'شماره موبایل', state: 'mobile_number', type: 'input' },
    // { title: 'نام و نام خانوادگی', state: 'full_name', type: 'input' },
    // { title: '', state: 'status', type: 'select', isHidden: true },
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
    // if (act === 'show' && rbac.r) availableActions.push('show');
    // if (act === 'edit' && rbac.u) availableActions.push('edit');
    if (act === 'delete' && rbac.d) availableActions.push('delete');
    // if (act === 'submit' && rbac.u) availableActions.push('submit');
  }

  return availableActions;
};
