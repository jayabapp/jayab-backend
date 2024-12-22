import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { p2e } from '../helpers/p2e.helper';
/**
 * this interceptor convert all persian number in body,params and query to en
 */
@Injectable()
export class P2EInterceptor implements NestInterceptor {
  async intercept(context: ExecutionContext, next: CallHandler): Promise<any> {
    const request = context.switchToHttp().getRequest();
    const body = request.body;
    const params = request.params;
    const query = request.query;

    /* ---------------------------------- body ---------------------------------- */
    for (const key in body) {
      const value = body[key];
      if (typeof value === 'string') body[key] = p2e(value);
    }
    request.body = body;

    /* --------------------------------- params --------------------------------- */
    for (const key in params) {
      const value = params[key];
      if (typeof value === 'string') params[key] = p2e(value);
    }
    request.params = params;

    /* ---------------------------------- query --------------------------------- */
    for (const key in query) {
      const value = query[key];
      if (typeof value === 'string') query[key] = p2e(value);
    }
    request.query = query;

    return next.handle();
  }
}
