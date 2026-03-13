import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UAParser } from 'ua-parser-js';
import { getModuleFromUrl } from '../helpers/get-url-module.helper';
import { Admin, PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export interface SuccessResponseArgs {
  messageCode?: MessageType;
  result?: any;
  // extra?: unknown;
}

export interface SuccessResponse {
  status: 'successful';
  messages: { fa: unknown };
  data: any;
}

type MessageType = keyof Messages;

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(async (data: SuccessResponseArgs) => {
        /* ----------------------------------- LOG ---------------------------------- */

        // Create a log only for these methods: POST, PUT, PATCH, DELETE
        const request = context.switchToHttp().getRequest();
        const targetModule = getModuleFromUrl(request.originalUrl); // required
        const admin = request.user as Admin;

        if (admin && request.method !== 'GET' && targetModule && admin?.role_id) {
          const response = context.switchToHttp().getResponse();
          const userAgentString = request.header('user-agent');
          const parser = new UAParser(userAgentString);

          await prisma.adminActivity.create({
            data: {
              os: parser.getOS()?.name,
              browser: parser.getBrowser()?.name,
              browser_ver: parser.getBrowser()?.major,
              ip_v4: request?.ip,
              admin_id: admin.id, // required
              module: targetModule, // required
              path: request.route.path, // required
              method: request.method, // required
              className: context.getClass().name, // required
              classMethod: context.getHandler().name, // required
              param: request?.params,
              query: request?.query,
              body: request?.body,
              result_id: data?.result?.id,
              status_code: response.statusCode, // required
            },
          });
        }

        return {
          status: 'successful',
          messages: { fa: new Messages()[data?.messageCode] },
          data: data?.result,
        };
      }),
    );
  }
}

class Messages {
  CREATE = 'ثبت با موفقیت انجام شد';
  DELETE = 'ایتم مورد نظر حذف شد';
  UPDATE = 'ویرایش با موفقیت انجام شد';
  COMMON1 = 'اطلاعات با موفقیت دریافت شد';
  COMMON2 = 'ثبت با موفقیت انجام شد';
  COMMON3 = 'ایتم مورد نظر حذف شد';
  COMMON4 = 'ویرایش با موفقیت انجام شد';
  COMMON5 = 'حذف آیتم با موفقیت انجام شد';
  COMMON6 = 'درخواست با موفقیت انجام شد';
  AUTH1 = 'کد ورود به شماره همراه شما ارسال شد';
  AUTH1_1 = 'کد ورود پیش از این به شماره همراه شما ارسال شده است';
  AUTH2 = 'درخواست شما برای کاربر ستاره دار با موفقیت ثبت شد';
  AUTH3 = 'شما با موفقیت وارد شدید';
  ADMIN_AUTH1 = 'سوپر ادمین با موفقیت ساخته شد';
  ADMIN_AUTH2 = 'شما با موفقیت وارد شدید';
  ADMIN_CITY1 = 'شهر/استان مورد نظر با موفقیت ثبت شد';
  WITHDRAWL1 = 'درخواست برداشت ثبت شد. پس از بررسی به حساب انتخاب شده واریز می شود';
  CC1 = 'کد تایید به شماره موبایل درخواستی ارسال شد';
  CC2 = 'ثبت کارت بانکی با موفقیت انجام شد';
  SUB_1 = 'خرید اشتراک با موفیت انجام شد';
  SMS1 = 'پیام شما برای مخاطب ارسال شد';
  SMS2 = '';
  TEAM1 = 'پیام شما برای همسفرهایتان ارسال شد';
  PAY1 = 'خرید با موفقیت انجام شد';

  // Ticket
  TICKET_SUBMITED_SUCCESSFULLY = 'تیکت با موفقیت ثبت شد';
  YOU_CAN_NOT_REPLY_THIS_TICKET =
    'تنها در صورتی که تیکت در وضعیت پاسخ داده شده باشد امکان ثبت پاسخ جدید وجود دارد';
  TICKET_REPLY_SUBMITED_SUCCESSFULLY = 'پاسخ تیکت با موفقیت ثبت شد';
  TICKET_DELETED_SUCCESSFULLY = 'تیکت با موفقیت حذف شد';
  TICKET_CLOSED_SUCCESSFULLY = 'تیکت با موفقیت بسته شد';
  ORDER1 = 'سفارش با موفقیت لغو شد';

  PRODUCT_TAG_ADDED = 'تگ های انتخابی ثبت شد';

  COMMENT1 = 'نظر شما ثبت شد و پس از بررسی منتشر می شود';
  CONTENT_QUESTION1 = 'پرسش شما ثبت شد و پس از بررسی و پاسخ ادمین منتشر می شود';

  FORM1 = 'فرم با موفقیت ثبت شد';

  RESERVE1 = 'درخواست لغو شد';
}
