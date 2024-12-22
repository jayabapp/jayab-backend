import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  constructor(private configService: ConfigService) {}

  catch(exception: any, host: ArgumentsHost): any {
    console.log('<>><<><><><><><><><><');

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    let statusCode: number;
    let message: string;
    let isNotFoundPage = false;

    if (exception instanceof HttpException) statusCode = exception.getStatus();
    else if (exception?.statusCode) {
      statusCode = exception?.statusCode;
      isNotFoundPage = true;
    } else statusCode = HttpStatus.INTERNAL_SERVER_ERROR;

    if (!isNotFoundPage) {
      message =
        exception instanceof HttpException
          ? failedMessages[exception.message] || exception.getResponse()?.['message'] || exception.message
          : 'Internal server error';
    }

    /* -------------------------------------------------------------------------- */
    /*                                   LOGGER                                   */
    /* -------------------------------------------------------------------------- */
    console.log({ exception });
    console.log(exception.stack);

    console.log('/* -------------------------------------------------------------------------- */');
    let data = `[${request.method}]: ${request.url} - ${statusCode}`;

    if (!isNotFoundPage) {
      data += `
error_message: ${message}
query: ${JSON.stringify(request.query)}
params: ${JSON.stringify(request.params)}
body: ${JSON.stringify(request.body)}
stacktrace: ${![422, 404].includes(statusCode) ? exception.stack : null}
        `;
    }

    this.logger.error(data);

    /* -------------------------------------------------------------------------- */
    /*                                  RESPONSE                                  */
    /* -------------------------------------------------------------------------- */
    response.status(statusCode).json({
      status: 'failed',
      statusCode: statusCode,
      messages: { fa: message },
      message_code: failedMessages[exception.message] ? exception.message : '',
    });
  }
}

const failedMessages = {
  FORBIDDEN: 'شما مجاز به انجام این عملیات نیستید',
  NOT_FOUND: 'ایتم مورد نظر یافت نشد',
  NOT_FOUND_CONTENT: 'محتوای مورد نظر یافت نشد',
  COMMON1: 'ایتم مورد نظر یافت نشد',
  COMMON2: 'ایتم مورد نظر قابل مشاهده نیست',
  COMMON3: 'وضعیت درخواستی اشتباه است',
  COMMON4: 'درخواست مورد نظر قابل انجام نمی باشد',
  COMMON5: 'درخواست تکراری است',
  CONTENT1: 'کلید محتوا تکراری است. لطفا آن را تغییر دهید',
  CONTENT2: 'اسلاگ محتوا تکراری است. لطفا آن را تغییر دهید',
  SETTING1: 'تنظیمات یافت نشد!',
  RBAC1: 'دسترسی برای این ماژول تعریف نشده است',
  RBAC2: 'شما به این ماژول دسترسی ندارید',
  RBAC3: 'دسترسی شما به این ماژول محدود است',
  RBAC4: 'امکان حذف سوپرادمین نیست',
  RBAC5: 'نام انتخابی تکراری است',
  RBAC6: 'نقش سوپرادمین قابل ویرایش نیست',
  ATTACH1: 'عکس باید به صورت مربعی باشد',
  ATTACH2: 'ابعاد تصویر از حداقل سایز مودر نیاز کمتر است',
  ATTACH3: 'فایل ارسال شده اشتباه است',
  ADMIN_AUTH1: 'نام کاربری یا رمز عبور اشتباه است',
  ADMIN_AUTH2: 'نام کاربری یا موبایل تکراری است',
  ADMIN_AUTH3: 'کلید ارسال شده اشتباه است',
  ADMIN_AUTH4: 'امکان ساخت سوپرادمین وجود ندارد',
  ADMIN_AUTH5: 'نقش انتخابی اشتباه است',
  ADMIN_AUTH6: 'برای نقش فروشگاه دار انتخاب فروشگاه اجباری است',
  ADMIN_AUTH7: 'فروشگاه یافت نشد',
  ADMIN_AUTH8: 'فروشگاه مورد نظر از پیش ادمین دارد',
  ADMIN_AUTH9: 'شما امکان ایجاد مدیر در نقش انتخاب شده را ندارید',
  ADMIN_AUTH10: '',
  AUTH1: 'کد تایید وجود ندارد',
  AUTH1_1: 'کد وارد شده صحیح نیست',
  AUTH2: 'کد وارد شده منقضی شده است',
  AUTH3: 'فایل مربوط به کاربر نیست',
  AUTH4: 'کد معرف وارد شده صحیح نیست',
  AUTH5: 'شماره غیر ایرانی وارد شده متعلق یه شما نمی باشد یا در پروفایل ایران شما ثبت نشده است',
  AUTH6: 'شما پیش از این ثبت نام کرده اید',
  AUTH7: 'نام کاربری تکراری است. نام دیگری را انتخاب کنید',
  AUTH8: 'شماره موبایل صحیح نیست',
  AUTH9: 'شماره شما در سامانه ثبت نشده است. لطفا با پشتیبانی تماس بگیرید',

  UPDATE_PROFILE1: 'شماره تلفن یا کد ملی توسط شخص دیگری ثبت شده است',
  USER_ADDRESS1: 'آدرس خارج از محدوده سرویس دهی است',
  USER_ADDRESS2: 'آدرس پیدا نشد',
  TICKET1: 'نمی توانید بیشتر از ۱۰ تیکت باز داشته باشید',
  BANNER1: 'فایل پیدا نشد',
  BANNER2: 'ملک پیدا نشد',
  BANNER3: 'شناسه دسته بندی الزامی است',
  COLOR1: 'کد هگز تکراری است',
  CHAT1: 'چت روم از قبل وجود دارد',
  CHAT2: 'پیام باید شامل متن یا فایل باشد',
  CHAT3: 'شما امکان دسترسی به این گروه را ندارید',
  CHAT4: 'شناسه گروه اشتباه است',
  CHAT5: 'برای پاسخ به پیام باید اشتراک فعال داشته باشید',
  CHAT6: 'اشتراک شما قابلیت پاسخ به پیام را ندارد',
  PROFILE1: 'شما تصویری بارگذاری نکرده اید',
  PROFILE2: '',
  BOOKMARK1: 'نوع بوک مارک اشتباه است',
  SMS1: 'سقف روزانه ارسال رایگان پیامک به پایان رسیده است',
  SMS2: 'سقف روزانه شما برای ارسال رایگان پیامک به پایان رسیده است',
  SMS3: '',
  CATEGORY1: 'کلید تکراری است',
  CATEGORY2: 'شناسه دسته بندی اصلی وارد شده اشتباه است',
  CATEGORY3: 'محصول باید به دسته بندی سطح آخر وصل شود',
  CATEGORY4: 'دسته بندی غیر فعال است',
  FILTER1: 'کلیدهای فیلتر نامعتبر هستند',
  FILTER2: 'کلیدهای عملیات نامعتبر هستند',
  BUSINESS1: 'نمتوانید بیشتر از ۲۵ تصویر بارگذاری کنید',
  BUSINESS2: 'شناسه عکس ها تکراری است',
  BUSINESS3: 'شناسه دسته بندی فرعی اشتباه است',
  BUSINESS4: 'شناسه های دسته بندی فرعی تکراری است',
  BUSINESS5: 'هزینه با تخفیف نمیتواند بزرگتر از هزینه اصلی باشد',
  BUSINESS6: 'انتخاب دسته بندی فرعی الزامی است',
  BUSINESS7: 'شناسه دسته بندی فرعی وارد شده اشتباه است',
  BUSINESS8: 'شناسه اشتباه است',
  BUSINESS9: 'شناسه تگ دسته بندی خاص اشتباه است',
  BUSINESS10: 'شناسه تگ کلاس قیمتی اشتباه است',
  BUSINESS11: 'شناسه دسته بندی اشتباه است',
  BUSINESS12: 'فروشگاه غیر فعال است',
  BUSINESS13: 'امکان ساخت چند فروشگاه وجود ندارد',
  BUSINESS14: 'یک فروشگاه اصلی وجود دارد',
  BUSINESS15: '',

  BUSINESS_SHIFT1: 'روز شیف تکراری است',
  BUSINESS_SHIFT2: 'ساعت شروع و ساعت پایان کار شیفت اشتباه است',
  BUSINESS_PRODUCT1: 'اطلاعات کسب و کار با محصول همخوانی ندارد',
  BUSINESS_PRODUCT2: 'قیمت باید از قیمت با تخفیف بزرگتر باشد',
  BUSINESS_PRODUCT3: 'شناسه محصول مربوط به فروشگاه شما نمی باشد',
  BUSINESS_PRODUCT4: 'ویژگی ارسال شده و گروه آن همخحوانی ندارند',
  BUSINESS_PRODUCT5: 'ویژگی ارسال شده با دسته بندی محصول همخوانی ندارد',
  BUSINESS_PRODUCT6:
    'دسته بندی این محصول دارای ویژگی قیمتی است و حتما باید برای آن ویژگی قیمتی تعریف و انتخاب شود',
  BUSINESS_PRODUCT7: 'پیش از این قیمت برای این محصول ثبت شده است',
  ORDER1: 'تعداد محصول اشتباه است',
  ORDER2: 'اطلاعات پس از اتمام خرید قابل تغییر نیست',
  ORDER3: 'سفارش پس از ثبت قابل حذف نمی باشد',
  ORDER4: 'شناسه سفارش اشتباه است',
  ORDER5: 'سفارش قبلا تسویه شده است',
  ORDER6: '',
  ORDER7: 'وضعیت اشتباه است',
  ORDER8: 'عملیات اشتباه است',
  ORDER9: 'امکان لغو سفارش وجود ندارد',
  ORDER10: 'آدرس را وارد کنید',
  ORDER11: 'مجدد تلاش کنید',
  ORDER12: 'فروشگاه تعطیل است',
  ORDER13: 'شیفت  کاری فروشگاه هنوز تعریف نشده است',
  ORDER14: 'تعداد درخواستی بیشتر از حداکثر تعداد قابل قبول در هر سفارش است',
  ORDER15: 'تعداد درخواستی بیشتر از موجودی کالا است',
  ORDER16: 'خرید محصول فعال نیست',
  ORDER17: 'لطفا روش ارسال را انتخاب کنید',
  ORDER18: 'اطلاعات برای دریافت حضوری کامل نیست',
  ORDER19: 'آدرس دریافت تعیین نشده است',
  ORDER20: '',
  ORDER21: '',
  PAY1: 'متاسفانه درگاه بانکی در دسترس نیست. لطفا چند دقیقه دیگر مجددا تلاش کنید',
  PAY2: 'مبلغ درخواستی از حداقل قابل قبول کمتر است',
  PAY3: 'پرداخت معتبر نیست. در صورت نیاز با پشتیبانی تماس بگیرید',
  PAY4: 'خطا در پرداخت',
  PAY5: 'پرداخت ناموفق',
  PAY6: 'درگاه پرداخت انتخاب نشده است',
  PAY7: '',
  OFFERCODE1: 'شناسه کاربران اشتباه است',
  OFFERCODE2: 'سفارش قابل ویرایش نیست',
  OFFERCODE3: 'کد تخفیف قبلا استفاده شده است',
  OFFERCODE4: 'کد تخفیف منقضی شده است',
  OFFERCODE5: 'کد تخفیف تکراری است',
  OFFERCODE6: 'کد تخفیف اشتباه است',
  OFFERCODE7: 'کد تخفیف مورد نظر هوز فعال نشده است',
  TURNOVER1: 'مجموع پرداختی به فروشگاه نباید از مجموع مبلغ بستانکاری فروشگاه بیشتر شود',
  TURNOVER2: 'مبلغ درخواستی برای کسر از کیف پول نباید از کل کیف پول بیشتر باشد',
  ATTR1: 'نام انتخاب شده تکراری است',
  ATTR2: 'هر محصول تنها یک گروه ویژگی میتواند داشته باشد',
  ATTR3: 'کلید انتخاب شده تکراری است',
  ATTR4: 'این ویژگی برای این محصول قابل ثبت نیست',
  ATTR5: '',
  BRAND1: 'عنوان تکراری است',
  BRAND2: '',
  PROD1: 'دسته بندی ارسال شده اشتباه است',
  PROD2: 'شناسه محصول ارسال نشده است',
  PROD3: 'محصول یافت نشد',
  PROD4: 'اسلاگ محصول تکراری است و امکان ثبت ندارد',
  PROD5: 'هنوز قیمتی برای این محصول تعریف نکرده اید',
  PROD6: 'این محصول هیچ قیمت تخفیف خورده ای ندارد',
  PROD7: 'این محصول فعال نیست',
  PROD8: 'محصول نمیتواند به دسته بندی والد وصل شود',
  PROD9: '',
  SPEC1: 'دسته بندی های انتخاب شده اشتباه است',
  SPEC2: 'دسته بندی انتخاب شده والد نیست',
  SPEC3: '',
  CONF1: 'فروشگاه تعریف نشده است',
  CONF2: 'گروه ویژگی ایجاد نشده است',
  CONF3: '',
  FORM1: 'قبل از ارسال درخواست جدید لطفا چند دقیقه صبر کنید',
  FORM2: 'عناوین ارسال شده با دسته بندی همخوانی ندارند',
  FORM3: 'همه فیلدهای الزامی را پر کنید',
  FORM4: 'لیست فرم ها خالی است',
  FORM5: 'شناسه تصویر اشتباه است',
  FORM6: 'مقدار را وارد کنید',
  FORM7: 'تصویر باید آرایه باشد',
  FORM8: '',
  DELIVERY1: 'روش ارسال اشتباه است',
  DELIVERY2: 'روش پرداخت اشتباه است',
  DELIVERY3: '',
  DELIVERY4: '',
  DELIVERY5: '',
  GATEWAY1: 'اطلاعات وارد شده صحیح نیست',
  GATEWAY2: 'اطلاعات وارد شده صحیح نیست',
  GATEWAY3: 'اطلاعات وارد شده صحیح نیست',
  GATEWAY4: 'پارمترهای درگاه برای فعال شدن صحیح نیست',
  GATEWAY5: 'درگـاه انتخاب شده فعال نیست',
  GATEWAY6: 'درگـاه انتخاب شده فعال نیست',
  GATEWAY7: '',

  USER1: 'این شماره موبایل در سامانه وجود دارد',
  USER2: '',
};
