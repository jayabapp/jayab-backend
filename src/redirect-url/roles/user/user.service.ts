import { Inject, Injectable } from '@nestjs/common';
import { RedirectUrl, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { FindAllRedirectUrlUserDto } from './dto/find-all.dto';
import { type CursorPaginatedResult, cursorPaginate } from 'src/common/helpers/cursor-paginator';
import { Cache } from 'cache-manager';
import { ONE_HOUR_TTL } from 'src/common/utils/constants/cache-ttl.constant';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { REDIRECT_URL_CACHE_KEY } from 'src/redirect-url/common/helpers/cache-key.constant';

@Injectable()
export class RedirectUrlUserService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly db: PrismaService,
  ) {}

  /**
   * find all RedirectUrl
   * @param dto
   * @returns
   */
  async findAll(dto: FindAllRedirectUrlUserDto): Promise<CursorPaginatedResult<RedirectUrl>> {
    const list = await cursorPaginate()<RedirectUrl, Prisma.RedirectUrlFindManyArgs>(
      this.db.redirectUrl,
      {},
      { cursor: dto.cursor },
    );

    return list;
  }

  /**
   * find one redirectUrl
   * @param redirectUrlId
   * @returns
   */
  async findOne(sourceHash: string): Promise<Partial<RedirectUrl>> {
    // read from cache
    const value = await this.cacheManager.get(REDIRECT_URL_CACHE_KEY(sourceHash));
    if (value) return JSON.parse(value as string);

    const item = await this.db.redirectUrl.findFirst({
      where: { source_hash: { equals: sourceHash } },
      select: { destination: true, permanent: true },
    });

    await this.cacheManager.set(REDIRECT_URL_CACHE_KEY(sourceHash), JSON.stringify(item), ONE_HOUR_TTL);
    return item;
  }
}
