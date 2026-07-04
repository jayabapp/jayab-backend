import { EnumList } from 'src/common/interfaces/model-props.interface';

export enum PropertyPhotoUpgradeRequestStatus {
  WAITING_PAYMENT = 10,
  PENDING = 20,
  IN_PROGRESS = 30,
  COMPLETED = 100,
}

export enum PropertyPhotoUpgradeRequestItemStatus {
  PENDING = 10,
  EDITED = 20,
}

export const PropertyPhotoUpgradeRequestStatusesList: Array<EnumList> = [
  { id: PropertyPhotoUpgradeRequestStatus.WAITING_PAYMENT, title: 'در انتظار پرداخت', hex: '#f59e0b' },
  { id: PropertyPhotoUpgradeRequestStatus.PENDING, title: 'در انتظار ویرایش', hex: '#3b82f6' },
  { id: PropertyPhotoUpgradeRequestStatus.IN_PROGRESS, title: 'در حال ویرایش', hex: '#8b5cf6' },
  { id: PropertyPhotoUpgradeRequestStatus.COMPLETED, title: 'تکمیل شده', hex: '#22c55e' },
];

export const PropertyPhotoUpgradeRequestItemStatusesList: Array<EnumList> = [
  { id: PropertyPhotoUpgradeRequestItemStatus.PENDING, title: 'در انتظار ویرایش', hex: '#3b82f6' },
  { id: PropertyPhotoUpgradeRequestItemStatus.EDITED, title: 'ویرایش شد', hex: '#22c55e' },
];
