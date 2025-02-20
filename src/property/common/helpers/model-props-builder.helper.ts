import { AccessControlList, Property, Prisma, PropertyOption, OptionsOnProperty } from '@prisma/client';
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
import { PropertyStatusesList } from '../types/property-status.type';
import {
  PropertyArrayResType,
  PropertyJsonResType,
  PropertyResType,
} from 'src/property/serializer/property.serializer';
import { isArray, isEmpty } from 'lodash';
import { PropertyOptionGroupList } from 'src/property-option/common/property-option-groups.type';
import { CancelingType, CancelingTypeList } from '../types/property-canceling-types.type';

/* -------------------------------------------------------------------------- */
/*                                    TYPES                                   */
/* -------------------------------------------------------------------------- */
enum RefEnum {
  feature_image = 'feature_image',
  province = 'province',
  city = 'city',
  remaining_days = 'remaining_days',
  status_number = 'status_number',
}
type ModelFields = keyof typeof RefEnum | keyof typeof Prisma.PropertyScalarFieldEnum;
type ModifiedFilterProps = CreateProps & { isHidden?: boolean };
type ModifiedColumn = Column & { key: ModelFields };
type ModifiedTableProps = TableProps & { columns: ModifiedColumn[] };

/* -------------------------------------------------------------------------- */
/*                                    SHOW                                    */
/* -------------------------------------------------------------------------- */
const bedroomsInfo = (item: PropertyResType): Array<ShowProps> => {
  const bedrooms: number[] = item?.bedrooms?.bedrooms;
  if (isEmpty(bedrooms)) return [];

  let list = [];
  for (let i = 0; i < bedrooms.length; i++) {
    const bedroomBeds = bedrooms[i];
    const number = i + 1;

    list.push({
      state: `bedroom${number}`,
      title: `تعداد تخت اتاق ${number}`,
      value: bedroomBeds,
      type: 'number',
    });
  }

  return list;
};

const options = (item: PropertyResType): Array<ShowProps> => {
  let list: ShowProps[] = [];

  for (const optionKey of Object.keys(item.options)) {
    const propertyOption = PropertyOptionGroupList.find((e) => e.id == optionKey.toUpperCase());

    const optionValue = item.options[optionKey];
    const propValue = isArray(optionValue) ? optionValue.join(' - ') : optionValue;
    list.push({
      state: `${propertyOption.id.toLocaleString().toLowerCase()}`,
      title: `${propertyOption.title}`,
      value: propValue,
      type: 'longString',
      titleClass: 'text-warning',
    });
  }

  return list;
};

export const showPropsBuilder = (item: PropertyResType): Array<ShowProps> => {
  const bedrooms = item.bedrooms;
  const dailyPrice = item.daily_price;

  const props: Array<ShowProps> = [
    { state: 'status_list', title: 'لیست وضعیت ها', value: PropertyStatusesList, isHidden: true },
    { state: 'admin_descriptions', title: 'لیست وضعیت ها', value: item.admin_descriptions, isHidden: true },
    /* -------------------------------------------------------------------------- */
    { type: 'dividerTitle', title: 'اطلاعات اصلی' },
    { state: 'id', title: 'شناسه', value: item.id, type: 'number', isEditable: false },
    { state: 'title', title: 'عنوان', value: item.title, type: 'string' },
    { state: 'code', title: 'کد', value: item.code, type: 'string' },
    {
      state: 'status',
      title: 'وضعیت',
      value: PropertyStatusesList.find((e) => e.id == item.status_number),
      type: 'chip',
    },
    { type: 'break' },
    /* -------------------------------------------------------------------------- */
    { state: 'is_authorized', title: 'احراز شده', value: item.is_authorized, type: 'boolean' },
    { state: 'has_blue_tick', title: 'دارای تیک آبی', value: item.has_blue_tick, type: 'boolean' },
    { state: 'remaining_days', title: 'باقیمانده اشتراک (روز)', value: item.remaining_days, type: 'number' },
    { state: 'is_today_reserved', title: 'امروز رزرو شده', value: item.is_today_reserved, type: 'boolean' },
    { type: 'break' },

    /* -------------------------------------------------------------------------- */
    { type: 'divider' },
    { type: 'dividerTitle', title: 'اطلاعات مالک' },
    {
      state: 'owner_mobile_number',
      title: 'شماره موبایل',
      value: item.owner.mobile_number,
      type: 'string',
      route: `/owners/show/${item.owner.id}`,
    },
    { state: 'owner_full_name', title: 'نام و نام خانوادگی', value: item.owner.full_name, type: 'string' },

    /* -------------------------------------------------------------------------- */
    { type: 'divider' },
    { type: 'dividerTitle', title: 'تعداد نفرات و قیمت ها (تومان)' },
    { state: 'std_capacity', title: 'ظرفیت استاندارد میهمان', value: item.std_capacity, type: 'number' },
    { state: 'max_capacity', title: 'حداکثر ظرفیت میهمان', value: item.max_capacity, type: 'number' },
    { type: 'break' },
    { state: 'normal', title: 'قیمت شنبه تا سه شنبه', value: dailyPrice?.normal, type: 'number' },
    { state: 'wednesday', title: 'قیمت چهارشنبه', value: dailyPrice?.wednesday, type: 'number' },
    { state: 'thursday', title: 'قیمت پنجشنبه', value: dailyPrice?.thursday, type: 'number' },
    { state: 'friday', title: 'قیمت جمعه', value: dailyPrice?.friday, type: 'number' },
    { state: 'peak', title: 'قیمت ایام پیک', value: dailyPrice?.peak, type: 'number' },
    { state: 'cleaning', title: 'هزینه نظافت', value: dailyPrice?.cleaning, type: 'number' },
    { state: 'today_offer', title: 'تخفیف امروز', value: dailyPrice?.today_offer, type: 'number' },
    {
      state: 'additional_person',
      title: 'قیمت نفر اضافه و سه سال به بالا',
      value: dailyPrice?.additional_person,
      type: 'number',
    },
    /* -------------------------------------------------------------------------- */
    { type: 'divider' },
    { type: 'dividerTitle', title: 'اطلاعات اصلی ملک' },
    { state: 'land_area', title: 'متراژ زمین', value: item.land_area, type: 'number' },
    { state: 'building_area', title: 'متراژ بنا', value: item.building_area, type: 'number' },
    { state: 'floors', title: 'تعداد طبقات', value: item.floors, type: 'number' },
    { state: 'unit_per_floor', title: 'تعداد واحد در طبقه', value: item.unit_per_floor, type: 'number' },
    { state: 'construction_year', title: 'سال ساخت', value: item.construction_year, type: 'number' },
    { state: 'province', title: 'استان', value: item.province, type: 'string' },
    { state: 'city', title: 'شهر', value: item.city, type: 'string' },
    { state: 'has_pool', title: 'استخر دارد', value: item.has_pool, type: 'boolean' },
    { state: 'address', title: 'آدرس دقیق ملک', value: item.address, type: 'longString' },
    /* -------------------------------------------------------------------------- */
    { type: 'divider' },
    { type: 'dividerTitle', title: 'اطلاعات اتاق و رخت خواب' },
    { state: 'total_bedrooms', title: 'تعداد اتاق', value: item.total_bedrooms, type: 'number' },
    { type: 'break' },
    ...bedroomsInfo(item),
    { type: 'break' },
    { state: 'master_room', title: 'تعداد اتاق مستر', value: bedrooms?.master_room, type: 'number' },
    { state: 'additional_bed', title: 'رخت خواب اضافه', value: bedrooms?.additional_bed, type: 'number' },
    { state: 'additional_bed', title: 'مبل تخت خواب شو', value: bedrooms?.additional_bed, type: 'number' },

    /* -------------------------------------------------------------------------- */
    { type: 'divider' },
    { type: 'dividerTitle', title: 'امکانات' },
    ...options(item),
    {
      type: 'longString',
      value: item.canceling_type?.title,
      title: 'قوانین کنسلی',
      titleClass: 'text-warning',
    },

    { type: 'divider' },
    { type: 'dividerTitle', title: 'امکانات عمومی ویلا' },
    { state: 'wc', title: 'سرویس بهداشتی فرنگی', value: bedrooms?.wc, type: 'number' },
    { state: 'wc_ir', title: 'سرویس بهداشتی ایرانی', value: bedrooms?.wc_ir, type: 'number' },
    { state: 'bathroom_general', title: 'حمام مشترک', value: bedrooms?.bathroom_general, type: 'number' },
    { state: 'bathroom_tub', title: 'حمام وان دار', value: bedrooms?.bathroom_tub, type: 'number' },
    { state: 'bathroom_in_wc', title: 'حمام در سرویس', value: bedrooms?.bathroom_in_wc, type: 'number' },
    { state: 'bathroom_master', title: 'حمام در اتاق', value: bedrooms?.bathroom_master, type: 'number' },

    /* -------------------------------------------------------------------------- */
    { type: 'divider' },
    { type: 'dividerTitle', title: 'توضیحات' },
    {
      type: 'longString',
      value: item.property_descriptions?.distance_dscr,
      title: 'فاصله از مراکز خرید',
    },
    {
      type: 'longString',
      value: item.property_descriptions?.facility_dscr,
      title: 'توضیحات امکانات',
    },
    {
      type: 'longString',
      value: item.property_descriptions?.pattern_dscr,
      title: 'توضیحات بافت',
    },
    {
      type: 'longString',
      value: item.property_descriptions?.property_dscr,
      title: 'توضیحات ملک',
    },
    {
      type: 'longString',
      value: item.property_descriptions?.ad_dscr,
      title: 'توضیحات تبلیغی',
    },
    {
      type: 'longString',
      value: item.property_descriptions?.guest_dscr,
      title: 'توضیحات نوع مهمان',
    },
    {
      type: 'longString',
      value: item.property_descriptions?.party_dscr,
      title: 'توضیحات برگزاری جشن',
    },
    {
      type: 'longString',
      value: item.property_descriptions?.pet_dscr,
      title: 'توضیحات پذیرش حیوانات خانگی',
    },
    {
      type: 'longString',
      value: item.property_descriptions?.property_dscr,
      title: 'توضیحات ملک',
    },
    {
      type: 'string',
      value: item.check_in_hour,
      title: 'ساعت ورود',
    },
    {
      type: 'string',
      value: item.check_out_hour,
      title: 'ساعت خروج',
    },

    /* -------------------------------------------------------------------------- */
    { type: 'divider' },
    { type: 'dividerTitle', title: 'تصاویر' },
    { state: 'feature_image', title: 'تصویر اصلی', value: item.feature_image, type: 'image' },

    { type: 'break' },
    { state: 'images', title: 'عکس های ملک', value: item.images, type: 'image' },
    // { state: 'media_ids', ref: 'media', value: item.media, type: 'image', isHidden: true },

    /* -------------------------------------------------------------------------- */
    { type: 'divider' },

    {
      state: 'coordinate',
      type: 'map',
      value: { lat: item.latitude, lng: item.longitude },
      title: 'موقعیت جغرافیایی',
    },
  ];

  return props;
};

/* --------------------------------- ACTIONS -------------------------------- */
export const showActionBuilder = (item: Property): Array<ShowAction> => {
  const actions: Array<ShowAction> = [
    {
      title: 'خرید اشتراک و سابقه',
      route: `/subscriptions/create?property_id=${item.id}`,
    },
    {
      title: 'صفحه ملک',
      route: `${process.env.BASE_URL}/property/${item.slug}`,
    },
    {
      title: 'تصاویر ملک',
      route: `/properties/show/${item.id}/images`,
    },
  ];

  return actions;
};

/* -------------------------------------------------------------------------- */
/*                                   CREATE                                   */
/* -------------------------------------------------------------------------- */
export const createPropsBuilder = (): Array<CreateProps> => {
  const createProps: Array<CreateProps> = [
    /* ---------------------------------- IMAGE --------------------------------- */
    // {state: 'image_id',type: 'image',title: 'تصویر اصلی',options: { isMandatory: true, titleHint: 'تنها یک عکس میتوانید آپلود کنید' },},
    /* ------------------------------ MULTI IMAGES ------------------------------ */
    // {state: 'media_ids',type: 'image',title: 'تصاویر ملک',options: { isMandatory: true, titleHint: 'آپلود حداقل یک مورد الزامی است', multiImage: true },},
    /* ---------------------------------- TEXT ---------------------------------- */
    // {state: 'title',type: 'input',title: 'عنوان',options: { maxLength: 100, isMandatory: true, placeholder: 'کد تخفیف تابستانه', keyboard: 'text' },},
    /* --------------------------------- NUMBER --------------------------------- */
    // {state: 'percentage',type: 'input',title: 'درصد تخفیف',options: { isMandatory: true, keyboard: 'number', convertToText: true,hint: 'سقف استفاده از تخفیف' },},
    /* ---------------------------------- DATE ---------------------------------- */
    // {state: 'start_at',type: 'date',title: 'تاریخ شروع کد تخفیف',options: { keyboard: 'number', isMandatory: true, convertToText: true },},
    /* --------------------------------- SELECT --------------------------------- */
    // {state: 'category_id',type: 'select',title: 'دسته بندی اصلی',selectItems: parentCategories,options: { isMandatory: true },},
    /* ------------------------------ MULTI SELECT ------------------------------ */
    // {state: 'tag_ids',type: 'multiSelect',title: 'تگ ها',selectItems: tags,options: {},},
    /* -------------------------------- TEXT AREA ------------------------------- */
    // {state: 'description',type: 'textarea',title: 'توضیحات',options: { keyboard: 'text', maxLength: 300 },},
    /* ----------------------------------- MAP ---------------------------------- */
    // {state: 'coordinate',type: 'map',title: 'موقعیت جغرافیایی',options: { isMandatory: true },},
    /* --------------------------------- DIVIDER -------------------------------- */
    // { type: 'divider' },
  ];

  return createProps;
};

/* -------------------------------------------------------------------------- */
/*                                    TABLE                                   */
/* -------------------------------------------------------------------------- */
export const tablePropsBuilder = (availableActions: Array<AvailableAction>): ModifiedTableProps => {
  const tableProps: ModifiedTableProps = {
    model: 'property',
    modelTitle: 'ملک',
    columns: [
      { id: 1, title: 'ردیف', key: 'id', cellType: 'number' },
      { id: 5, title: 'تصویر', key: 'feature_image', cellType: 'image' },
      { id: 10, title: 'عنوان', key: 'title', cellType: 'string' },
      { id: 15, title: 'کد', key: 'code', cellType: 'string', optionalClass: 'text-warning' },
      { id: 25, title: 'استان', key: 'province', cellType: 'string' },
      { id: 20, title: 'شهر', key: 'city', cellType: 'string' },
      { id: 30, title: 'وضعیت', key: 'status_number', cellType: 'enum', enumList: PropertyStatusesList },
      { id: 35, title: 'تاریخ ثبت ملک', key: 'created_at', cellType: 'dateTime' },
      { id: 40, title: 'وضعیت احراز', key: 'is_authorized', cellType: 'boolean' },
      { id: 45, title: 'دارای تیک آبی', key: 'has_blue_tick', cellType: 'boolean' },
      {
        id: 50,
        title: 'باقیمانده اشتراک (روز)',
        key: 'remaining_days',
        cellType: 'number',
        optionalClass: 'text-success',
      },
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
    { title: 'کد', state: 'code', type: 'input' },
    { type: 'break' },
    { title: 'منقضی شده', state: 'expired', type: 'switch' },
    { title: 'احراز شده', state: 'authorized', type: 'switch' },
    /*  */
    { title: 'وضیعت', state: 'status', type: 'select', isHidden: true },
    { title: '', state: 'owner_id', type: 'input', isHidden: true },
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
    // if (act === 'edit' && rbac.u) availableActions.push('edit');
    // if (act === 'delete' && rbac.d) availableActions.push('delete');
    // if (act === 'submit' && rbac.u) availableActions.push('submit');
  }

  return availableActions;
};
