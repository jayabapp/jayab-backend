import { EnumList } from 'src/common/interfaces/model-props.interface';

export enum FormBuilderInputType {
  SELECT = 'select',
  MULTI_SELECT = 'multi_select',
  INPUT = 'input',
  TEXT_AREA = 'textarea',
  IMAGE = 'image',
  TITLE = 'title',
  BREAK = 'break',
}

export const formBuilderInputList: EnumList[] = [
  { id: FormBuilderInputType.INPUT, title: 'تایپی', hex: '#0EA5E9' },
  { id: FormBuilderInputType.TEXT_AREA, title: 'تایپی - چند خطی', hex: '#10B981' },
  { id: FormBuilderInputType.SELECT, title: 'لیست انتخابی', hex: '#6366F1' },
  { id: FormBuilderInputType.MULTI_SELECT, title: 'لیست چند انتخابی', hex: '#FACC15' },
  { id: FormBuilderInputType.IMAGE, title: 'تصویر', hex: '#F97316' },
  { id: FormBuilderInputType.TITLE, title: 'عنوان', hex: '#06B6D4' },
  { id: FormBuilderInputType.BREAK, title: 'سطر جدید', hex: '#8B5CF6' },
];
