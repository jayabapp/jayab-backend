import { EnumList } from 'src/common/interfaces/model-props.interface';

export enum FormStatuses {
  WAITING_TO_REVIEW = 30,
  REVIEWED = 40,
}

export const FormStatusesList: Array<EnumList> = [
  {
    id: FormStatuses.WAITING_TO_REVIEW,
    title: 'منتظر بررسی',
    hex: '#eab308',
  },
  {
    id: FormStatuses.REVIEWED,
    title: 'بررسی شده',
    hex: '#84cc16',
  },
];
