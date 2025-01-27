export enum NotificationTypes {
  NEW_TICKET = 'NewTicket',
  NEW_USER_ACCOUNT = 'NewUserAccount',
  NEW_ADVISOR_ACCOUNT = 'NewAdvisorAccount',
  NEW_OWNER_ACCOUNT = 'NewOwnerAccount',
  NEW_PROPERTY_AUTH = 'NewPropertyAuth',
  NEW_PROPERTY_BADGE = 'NewPropertyBadge',
  OWNER_PROPERTY = 'OwnerProperty',
  ADVISOR_SUBSCRIPTION = 'AdvisorSubscription',
}

export const NotificationPermissionList = [
  { id: 1, title: 'تیکت جدید', value: NotificationTypes.NEW_TICKET },

  { id: 2, title: 'کاربر جدید', value: NotificationTypes.NEW_USER_ACCOUNT },
  { id: 3, title: 'مالک جدید', value: NotificationTypes.NEW_OWNER_ACCOUNT },
  { id: 4, title: 'مشاور جدید', value: NotificationTypes.NEW_ADVISOR_ACCOUNT },

  { id: 5, title: 'احراز ملک جدید', value: NotificationTypes.NEW_PROPERTY_AUTH },
  { id: 6, title: 'درخواست ممتاز شدن ملک', value: NotificationTypes.NEW_PROPERTY_BADGE },

  { id: 7, title: 'ملک جدید', value: NotificationTypes.OWNER_PROPERTY },
];
