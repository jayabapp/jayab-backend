import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsString,
  Length,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidationOptions,
  IsLatitude,
  IsLongitude,
  ArrayMinSize,
  ArrayMaxSize,
  IsUrl,
  ArrayNotEmpty,
  IsIn,
  IsHexColor,
  IsDate,
  MinDate,
  IsPositive,
  IsEmail,
  IsAlpha,
  IsAlphanumeric,
} from 'class-validator';

/**
 * - Push custom message to any validationOptions
 * @param validator
 * @param args
 * @returns
 */
const ValidateBy = (
  validator: (...args: any[]) => PropertyDecorator,
  args: any[] = [],
): PropertyDecorator => {
  args.push(<ValidationOptions>{
    message: (validationArgs) =>
      VM[validator.name]
        ? VM[validator.name](PROPS[validationArgs.property] || 'فیلد')
        : `${validationArgs.property} اشتباه است`,
  });
  return validator(...args);
};

/* --------------------------- Translated messges --------------------------- */
const VM = {
  Length: (title: string): string => `${title} باید حداقل $constraint1 و حداکثر $constraint2 کاراکتر باشد`,
  MaxLength: (title: string): string => `${title} باید حداکثر $constraint1 کاراکتر باشد`,
  MinLength: (title: string): string => `${title} باید حداقل $constraint1 کاراکتر باشد`,
  IsNotEmpty: (title: string): string => `${title} الزامی است`,
  IsString: (title: string): string => `فرمت ${title} وارد شده صحیح نمی باشد`,
  IsNumberString: (title: string): string => `${title} باید عددی باشد`,
  IsNumber: (title: string): string => `${title} باید عددی باشد`,
  IsInt: (title: string): string => `${title} باید عدد باشد`,
  IsBoolean: (title: string): string => `نوع ${title} اشتباه است`,
  IsEnum: (title: string): string => `نوع ${title} اشتباه است`,
  IsArray: (title: string): string => `${title} باید به صورت آرایه باشد`,
  ArrayMinSize: (title: string): string => `حداقل $constraint1 ${title} انتخاب کنید`,
  ArrayMaxSize: (title: string): string => `حداکثر می توانید $constraint1 ${title} انتخاب کنید`,
  Min: (title: string): string => `حداقل مقدار ${title} $constraint1 باید باشد`,
  Max: (title: string): string => `حداکثر مقدار ${title} $constraint1 باید باشد`,
  IsLatitude: (): string => 'عرض جغرافیایی صحیح نمی باشد',
  IsLongitude: (): string => 'طول جغرافیایی صحیح نمی باشد',
  IsUrl: (title: string): string => `${title} صحیح نمی باشد`,
  ArrayNotEmpty: (title: string): string => `لطفا ${title} را انتخاب کنید`,
  IsIn: (title: string): string => `${title} باید یکی از مقادیر $constraint1 باشد`,
  IsHexColor: (title: string): string => `${title} باید هگز باشد`,
  IsDate: (title: string): string => `${title} اشتباه است`,
  MinDate: (title: string): string => `${title} باید از تاریخ امروز به بعد باشد`,
  IsPositive: (title: string): string => `${title} وارد شده صحیح نیست`,
  IsEmail: (title: string): string => `${title} وارد شده صحیح نیست`,
  _IsAlphanumeric: (title: string): string => `فقط اعداد و حروف انگلیسی مجاز است`,
};

/* -------------------------- Translated properties ------------------------- */
const PROPS = {
  mobile_number: 'شماره تلفن همراه',
  code: 'کد',
  title: 'عنوان',
  username: 'نام کاربری',
  password: 'رمز عبور',
  repeat_password: 'تکرار رمز عبور',
  gender: 'جنسیت',
  is_active: 'وضعیت فعال بودن',
  role: 'نقش',
  full_name: 'نام و نام خانوادگی',
  national_id: 'کد ملی',
  tel: 'تلفن ثابت',
  city_id: 'شهر',
  cities: 'شهرها',
  profile_image: 'عکس پروفایل',
  profile_image_id: 'عکس پروفایل',
  group: 'گروه انتخابی',
  key: 'کلید',
  small_text: 'متن کوتاه',
  full_text: 'متن بلند',
  category: 'دسته بندی',
  country: 'کشور',
  country_id: 'کشور',
  province: 'استان',
  province_id: 'استان',
  prefix: 'عدد کنترل',
  description: 'توضیحات',
  image_id: 'تصویر',
  logo_id: 'تصویر',
  tag_id: 'تگ',
  value: 'مقدار',
  birthday: 'تاریخ تولد',
  phone_number: 'شماره تماس',
  address: 'آدرس',
  postal_code: 'کد پستی',
  address_id: 'شناسه آدرس',
  lat: 'عرض جغرافیایی',
  lng: 'طول جغرافیایی',
  category_id: 'دسته بندی اصلی',
  organization_id: 'سازمان',
  invitation_code: 'کد دعوت',
  team_id: 'شناسه تیم',
  shift_duration: 'نوع کشیک',
  capacity: 'ظرفیت',
  hex: 'کد هگز',
  flag: 'پرچم',
  name: 'نام',
  name_en: 'نام انگلیسی',
  iso: 'ایزو',
  mobile_length: 'طول شماره موبایل',
  separator: 'جدا کننده',
  status: 'وضعیت',
  country_code: 'کد کشور',
  role_id: 'نقش',
  priority: 'الویت',
  is_urgent: 'فوری',
  page: 'صفحه',
  link: 'لینک',
  type: 'تایپ',
  foreigners_code: 'شناسه اتباع',
  order: 'ترتیب',
  text: 'متن پیام',
  foreign_mobile: 'شماره موبایل خارج از ایران',
  recipient_full_name: 'نام تحویل گیرنده',
  recipient_phone_number: 'شماره تماس تحویل گیرنده',
  cursor: 'cursor',
  price: 'قیمت',
  discounted_price: 'قیمت با تخفیف',
  product_code: 'کد محصول',
  parent_id: 'آیدی دسته بندی اصلی',
  sheba: 'شماره شبا',
  unit_id: 'واحد',
  sub_category_id: 'دسته بندی فرعی',
  tag_ids: 'شناسه های تگ',
  optional_description: 'توضیحات اضافه',
  coordinate: 'موقعیت جغرافیایی',
  media: 'تصاویر',
  delivery_cost: 'هزینه ارسال',
  category_key: 'کلید دسته بندی',
  free_delivery_cost: 'کلید هزینه ارسال رایگان',
  price_class_id: 'شناسه کلاس قیمتی',
  special_category_id: 'شناسه دسته بندی ویژه',
  with_discount: 'کلید تخفیف دار',
  day: 'روز',
  start_hour: 'ساعت شروع',
  end_hour: 'ساعت پایان',
  day_title: 'عنوان روز',
  keys: 'کلید',
  business_id: 'شناسه فروشگاه',
  product_id: 'شناسه محصول',
  rate: 'امتیاز',
  start_date: 'تاریخ شروع',
  end_date: 'تاریخ پایان',
  time: 'زمان',
  user_ids: 'شناسه کاربران',
  percentage: 'درصد',
  max_amount: 'بیشترین مقدار',
  start_at: 'تاریخ شروع',
  expire_at: 'تاریخ انقضا',
  redirect_url: 'لینک بازگشت',
  commission: 'درصد کمیسیون',
  amount: 'مبلغ',
  detail: 'جزئیات',
  feature_image_id: 'عکس شاخص',
  feature_image: 'عکس شاخص',
  video_id: 'شناسه ویدئو',
  select_options: 'مقادیر قابل انتخاب',
  position: 'موقعیت',
  category_ids: 'دسته بندی ها',
  content_id: 'شناسه محتوا',
  params: 'پارامترها',
  slug: 'اسلاگ',
  payment_method_id: 'روش پرداخت',
  economic_code: 'کد اقتصادی',
  registration_number: 'شماره ثبت',
  contact_number: 'شماره تماس',
  admin_description: 'توضیحات مدیر',
};

/* ------------------------------- Decorators ------------------------------- */
export const _Length = (c1: number, c2: number): PropertyDecorator => ValidateBy(Length, [c1, c2]);
export const _IsNotEmpty = (): PropertyDecorator => ValidateBy(IsNotEmpty);
export const _IsHexColor = (): PropertyDecorator => ValidateBy(IsHexColor);
export const _IsString = (): PropertyDecorator => ValidateBy(IsString);
export const _IsNumberString = (): PropertyDecorator => ValidateBy(IsNumberString, [{ no_symbols: false }]);
export const _IsNumber = (): PropertyDecorator =>
  ValidateBy(IsNumber, [{ allowNaN: false, allowInfinity: false }]);
export const _IsInt = (): PropertyDecorator => ValidateBy(IsInt, []);
export const _IsBoolean = (): PropertyDecorator => ValidateBy(IsBoolean);
export const _IsEnum = (c1: any): PropertyDecorator => ValidateBy(IsEnum, [c1]);
export const _MaxLength = (c1: number): PropertyDecorator => ValidateBy(MaxLength, [c1]);
export const _MinLength = (c1: number): PropertyDecorator => ValidateBy(MinLength, [c1]);
export const _IsArray = (): PropertyDecorator => ValidateBy(IsArray);
export const _ArrayMinSize = (c1: number): PropertyDecorator => ValidateBy(ArrayMinSize, [c1]);
export const _ArrayMaxSize = (c1: number): PropertyDecorator => ValidateBy(ArrayMaxSize, [c1]);
export const _Min = (c1: number): PropertyDecorator => ValidateBy(Min, [c1]);
export const _Max = (c1: number): PropertyDecorator => ValidateBy(Max, [c1]);
export const _IsLatitude = (): PropertyDecorator => ValidateBy(IsLatitude, []);
export const _IsLongitude = (): PropertyDecorator => ValidateBy(IsLongitude, []);
export const _IsUrl = (): PropertyDecorator => ValidateBy(IsUrl, []);
export const _IsDate = (): PropertyDecorator => ValidateBy(IsDate, []);
export const _MinDate = (c1: Date): PropertyDecorator => ValidateBy(MinDate, [c1]);
export const _ArrayNotEmpty = (): PropertyDecorator => ValidateBy(ArrayNotEmpty, []);
export const _IsIn = (c1: Array<number | string>): PropertyDecorator => ValidateBy(IsIn, [c1]);
export const _IsEmail = (): PropertyDecorator => ValidateBy(IsEmail, []);
export const _IsAlphanumeric = (): PropertyDecorator => ValidateBy(IsAlphanumeric, []);
