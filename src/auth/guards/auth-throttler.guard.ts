import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ThrottlerException } from '@nestjs/throttler';
import { Request, Response } from 'express';
import { createHash } from 'crypto';
import Redis from 'ioredis';

type AuthThrottleRecord = {
  ip: string;
  hits: number;
  windowExpiresAt: number;
  blockedUntil: number;
  strikes: number;
  lastViolationAt: number;
};

@Injectable()
export class AuthThrottlerGuard implements CanActivate {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  // محدودیت پایه auth: هر کاربر/موبایل/ادمین در هر ۱۵ دقیقه فقط ۵ بار مجاز است.
  private readonly limit = 3;

  // محدودیت کلی IP: اگر شماره‌های مختلف هم تست شوند، یک IP بیشتر از ۲۰ درخواست در ۱۵ دقیقه نمی‌تواند بزند.
  private readonly ipLimit = 20;

  private readonly windowMs = 15 * 60 * 1000;

  // اگر ۲۴ ساعت تخلف جدید نداشته باشد، شدت بلاک دوباره از مرحله اول شروع می‌شود.
  private readonly strikeResetMs = 24 * 60 * 60 * 1000;

  // بلاک‌ها تصاعدی زیاد می‌شوند، اما بیشتر از ۴ ساعت نمی‌شوند.
  private readonly maxBlockMs = 4 * 60 * 60 * 1000;

  // این state در Redis نگهداری می‌شود؛ با restart اپ پاک نمی‌شود و بین instanceها مشترک است.
  private readonly redisKeyPrefix = 'auth-throttle';

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { req, res } = this.getRequestResponse(context);
    const now = Date.now();
    const ipKey = this.generateIpKey(context, req);
    const identityKey = this.generateIdentityKey(context, req);
    const ipRecord = await this.getRecord(ipKey, now, req.ip);
    const identityRecord = await this.getRecord(identityKey, now, req.ip);

    // اول محدودیت کلی IP چک می‌شود تا تغییر شماره موبایل باعث دور زدن محدودیت نشود.
    await this.applyLimit(ipKey, ipRecord, this.ipLimit, now, res);

    // بعد محدودیت دقیق‌تر IP + شماره/اکانت چک می‌شود.
    await this.applyLimit(identityKey, identityRecord, this.limit, now, res);

    // headerها برای اینکه کلاینت بداند چند درخواست باقی مانده و چه زمانی reset می‌شود.
    // res.header('X-Auth-RateLimit-Limit', this.limit.toString());
    // res.header('X-Auth-RateLimit-Remaining', Math.max(0, this.limit - record.hits).toString());
    // res.header('X-Auth-RateLimit-Reset', Math.ceil((record.windowExpiresAt - now) / 1000).toString());

    return true;
  }

  private async applyLimit(
    key: string,
    record: AuthThrottleRecord,
    limit: number,
    now: number,
    res: Response,
  ): Promise<void> {
    // اگر قبلاً بلاک شده باشد، تا پایان زمان بلاک هیچ درخواست auth جدیدی قبول نمی‌شود.
    if (record.blockedUntil > now) {
      this.throwBlocked(res, record.blockedUntil - now);
    }

    // بعد از تمام شدن پنجره ۱۵ دقیقه‌ای، شمارنده درخواست‌ها از صفر شروع می‌شود.
    if (record.windowExpiresAt <= now) {
      record.hits = 0;
      record.windowExpiresAt = now + this.windowMs;
    }

    record.hits += 1;

    // بعد از عبور از سقف هر bucket، بلاک تصاعدی همان bucket فعال می‌شود.
    if (record.hits > limit) {
      const blockMs = this.getBlockMs(record, now);
      record.hits = 0;
      record.windowExpiresAt = now + this.windowMs + blockMs;
      record.blockedUntil = now + blockMs;
      record.lastViolationAt = now;
      await this.saveRecord(key, record, now);

      this.throwBlocked(res, blockMs);
    }

    await this.saveRecord(key, record, now);
  }

  private async getRecord(key: string, now: number, ip: string): Promise<AuthThrottleRecord> {
    const cachedRecord = await this.redis.get(key);
    let record = cachedRecord ? (JSON.parse(cachedRecord) as AuthThrottleRecord) : null;

    if (!record) {
      record = {
        ip,
        hits: 0,
        windowExpiresAt: now + this.windowMs,
        blockedUntil: 0,
        strikes: 0,
        lastViolationAt: 0,
      };
    }

    // برای رکوردهای قدیمی Redis که قبل از اضافه شدن IP ساخته شده‌اند.
    record.ip = record.ip || ip;

    // اگر آخرین تخلف قدیمی باشد، سابقه تخلف پاک می‌شود و بلاک بعدی از ۱۵ دقیقه شروع می‌شود.
    if (record.lastViolationAt && now - record.lastViolationAt > this.strikeResetMs) {
      record.strikes = 0;
      record.lastViolationAt = 0;
    }

    return record;
  }

  private async saveRecord(key: string, record: AuthThrottleRecord, now: number): Promise<void> {
    const expiresAt = Math.max(
      record.windowExpiresAt,
      record.blockedUntil,
      record.lastViolationAt ? record.lastViolationAt + this.strikeResetMs : 0,
    );
    const ttlMs = Math.max(expiresAt - now, this.windowMs);

    await this.redis.set(key, JSON.stringify(record), 'PX', ttlMs);
  }

  private getBlockMs(record: AuthThrottleRecord, now: number): number {
    // هر تخلف جدید مدت بلاک را دو برابر می‌کند: ۱۵، ۳۰، ۶۰، ۱۲۰، ۲۴۰ دقیقه.
    if (!record.lastViolationAt || now - record.lastViolationAt > this.strikeResetMs) {
      record.strikes = 0;
    }

    record.strikes += 1;

    return Math.min(this.windowMs * 2 ** (record.strikes - 1), this.maxBlockMs);
  }

  private throwBlocked(res: Response, retryAfterMs: number): never {
    // const retryAfter = Math.ceil(retryAfterMs / 1000);
    // res.header('Retry-After', retryAfter.toString());
    // res.header('X-Auth-RateLimit-Remaining', '0');
    // res.header('X-Auth-RateLimit-Reset', retryAfter.toString());

    throw new ThrottlerException('تعداد درخواست های احراز هویت بیش از حد مجاز شده است');
  }

  private generateIdentityKey(context: ExecutionContext, req: Request): string {
    // کلید throttle ترکیبی از route، IP و شناسه auth است تا هر endpoint و هر شماره/اکانت جدا محدود شود.
    const rawIdentifier =
      req.body?.mobile_number || req.body?.username || req.user?.['id'] || req.ip || 'anonymous';
    const identifier = `${req.ip}:${rawIdentifier}`.toLowerCase();
    const route = `${context.getClass().name}:${context.getHandler().name}`;

    const hash = createHash('sha256').update(`${route}:${identifier}`).digest('hex');
    return `${this.redisKeyPrefix}:identity:${hash}`;
  }

  private generateIpKey(context: ExecutionContext, req: Request): string {
    // این کلید فقط بر اساس IP ساخته می‌شود تا اسپم با شماره‌های مختلف هم محدود شود.
    const route = `${context.getClass().name}:${context.getHandler().name}`;
    const hash = createHash('sha256').update(`${route}:${req.ip}`).digest('hex');
    return `${this.redisKeyPrefix}:ip:${hash}`;
  }

  private getRequestResponse(context: ExecutionContext): { req: Request; res: Response } {
    const http = context.switchToHttp();
    return { req: http.getRequest<Request>(), res: http.getResponse<Response>() };
  }
}
