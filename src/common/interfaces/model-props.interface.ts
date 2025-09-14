import { AttachmentAdminFolder } from 'src/attachment/interfaces/attachment-folder.enum';

export type FilterProps = {
  id: number;
  title: string;
  key: string;
  nestedKey?: string;
  type: 'string' | 'number' | 'select';
  disabled?: boolean;
  selectItems?: Array<any>;
  isHidden?: boolean;
  operators: Array<OperatorItems>;
  searchRoute?: string;
};

/* ---------------------------------- TABLE --------------------------------- */
export type EnumList = { title: string; id: string | number | boolean; hex: string; sub_title?: string };

export type Column = {
  id: number;
  title: string;
  cellType: CellType;
  nestedKey?: string;
  key: string;
  enumList?: Array<EnumList>;
  isEditable?: boolean;
  editableList?: any;
  update_key?: string;
  is_multiselect?: boolean;
  formOptions?: FormOptions;
  optionalClass?: string;
  link?: string;
  conditions?: ColCondition[];
};

export type ColCondition = { operator: OperatorType; target: number | string | number[]; className: string };
export type OperatorType = 'equals' | 'contains' | 'lt' | 'lte' | 'gt' | 'gte' | 'not' | 'between';

export type AvailableAction = 'create' | 'show' | 'edit' | 'delete' | 'submit' | 'custom';
export type TableProps = {
  model: string;
  modelTitle: string;
  columns: Column[];
  availableActions: Array<AvailableAction>;
};

export type CellType =
  | 'string'
  | 'number'
  | 'image'
  | 'boolean'
  | 'color'
  | 'arrayOfStrings'
  | 'html'
  | 'object'
  | 'enum'
  | 'date'
  | 'dateTime'
  | 'colorfulList'
  | 'link';

/* ---------------------------------- SHOW ---------------------------------- */
export type ShowPropsUnionType =
  | 'string'
  | 'number'
  | 'image'
  | 'video'
  | 'html'
  | 'boolean'
  | 'longString'
  | 'date'
  | 'dateObject'
  | 'list'
  | 'map'
  | 'chip'
  | 'object'
  | 'break'
  | 'divider'
  | 'dividerTitle'
  | 'color';
export type ShowProps = {
  state?: string;
  title?: string;
  value?: unknown;
  type?: ShowPropsUnionType;
  isEditable?: boolean;
  isHidden?: boolean;
  nestedKey?: string;
  ref?: string;
  titleClass?: string;
  containerClass?: string;
  route?: string;
};

/* --------------------------------- CREATE --------------------------------- */
export type CreateProps = {
  state?: string;
  type:
    | 'input'
    | 'tagInput'
    | 'textarea'
    | 'colorInput'
    | 'select'
    | 'multiSelect'
    | 'video'
    | 'switch'
    | 'image'
    | 'editor'
    | 'map'
    | 'date'
    | 'break'
    | 'divider'
    | 'dividerTitle';
  title?: string;
  options?: FormOptions;
  selectItems?: Array<any>;
  searchRoute?: string;
  searchColumn?: string;
  fixQuery?: string;
};

export type FormOptions = {
  placeholder?: string;
  isMandatory?: boolean;
  containerClass?: string;
  extraButton?: string;
  titleClass?: string;
  hint?: string;
  titleHint?: string;
  inputClass?: string;
  keyboard?: 'number' | 'password' | 'text';
  maxLength?: number;
  disabled?: boolean;
  convertToText?: boolean;
  rows?: number;
  multiImage?: boolean;
  imageType?: AttachmentAdminFolder;
  unit?: string;
  initValue?: boolean;
  property?: string;
  switchCheckedTitle?: string;
  switchUncheckedTitle?: string;
};
/* --------------------------------- ACTIONS -------------------------------- */
export type ShowAction = {
  title: string;
  route: string;
  color?: 'primary' | 'default' | 'secondary' | 'success' | 'warning' | 'danger' | undefined;
  targetBlank?: boolean;
};

export type OperatorItems = {
  id: number;
  operator: string;
  title: string;
  types: Array<string>;
};
