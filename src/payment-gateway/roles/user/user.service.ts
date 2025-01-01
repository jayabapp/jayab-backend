import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PaymentGateway, Prisma } from '@prisma/client';
import { HttpExceptionFilter } from 'src/common/filter/http-exception.filter';
import { PaymentGatewayEnum } from 'src/payment-gateway/common/payment-gateway.enum';
import { PrismaService } from 'src/prisma/prisma.service';
import { Cache } from 'cache-manager';
import { ONE_HOUR_TTL } from 'src/common/utils/constants/cache-ttl.constant';

@Injectable()
export class PaymentGatewayUserService {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  constructor(
    private readonly db: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  /**
   * find all PaymentGateway
   * @param dto
   * @returns
   */
  async findAll(): Promise<Partial<PaymentGateway>[]> {
    const list = await this.db.paymentGateway.findMany({
      where: { is_active: true },
      select: { id: true, logo: true, title: true, key: true },
    });

    return list;
  }

  /**
   * find one by key  Rayan comment: .,k a.,lk
   * @param key
   * @returns
   */
  async findOneByKey(key: PaymentGatewayEnum): Promise<PaymentGateway> {
    const CACHE_KEY = `gateway:${key}`;
    const value = (await this.cacheManager.get(CACHE_KEY)) as string;
    if (!!value) return JSON.parse(value) as PaymentGateway;

    const gate = await this.db.paymentGateway.findFirst({ where: { key } });

    if (!gate) this.logger.error('درگـاه انتخاب شده وجود ندارد');
    if (!gate.is_active) this.logger.warn(`⚠ درگـاه ${gate.title} فعال نیست`);

    //Cache
    await this.cacheManager.set(CACHE_KEY, JSON.stringify(gate), ONE_HOUR_TTL);

    return gate;
  }
}
