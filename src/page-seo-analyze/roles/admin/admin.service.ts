import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AccessControlList, PageSeoAnalyze, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePageSeoAnalyzeAdminDto } from './dto/create.dto';
import { UpdatePageSeoAnalyzeAdminDto } from './dto/update.dto';
import {
  CreateProps,
  FilterProps,
  OperatorItems,
  ShowAction,
  ShowProps,
  TableProps,
} from 'src/common/interfaces/model-props.interface';
import { operators, operatorsList } from 'src/common/utils/constants/filter-operators.constant';
import { type PaginatedResult, paginate } from 'src/common/helpers/paginator';
import {
  allActionsBuilder,
  createPropsBuilder,
  filterPropsBuilder,
  showActionBuilder,
  showPropsBuilder,
  tablePropsBuilder,
} from 'src/page-seo-analyze/common/helpers/model-props-builder.helper';
import { UpdatePartialPageSeoAnalyzeAdminDto } from './dto/update-partial.dto';
import { __baseDir } from 'src/config/settings';
import fs from 'fs/promises';
import { XMLParser } from 'fast-xml-parser';
import { PageSeoAnalyzeStatus } from 'src/page-seo-analyze/common/interfaces/scraper-status.enum';
import { isEmpty } from 'lodash';
import crypto from 'crypto';
import scrape from 'src/page-seo-analyze/common/helpers/seo-scraper.helper';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { TEN_MINUTES_TTL } from 'src/common/utils/constants/cache-ttl.constant';

@Injectable()
export class PageSeoAnalyzeAdminService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly db: PrismaService,
  ) { }

  /**
   * این تابع اطلاعات پیج رو اپدیت میکنه
   * @param pageId
   * @returns
   */
  async scrapAndCreateReport(pageId?: number): Promise<PageSeoAnalyze> {
    /* ----------------------------- find next page ----------------------------- */
    let nextAnalyze: PageSeoAnalyze;
    if (pageId) nextAnalyze = await this.db.pageSeoAnalyze.findFirst({ where: { id: +pageId } });
    else
      nextAnalyze = await this.db.pageSeoAnalyze.findFirst({
        where: {
          scraper_flag: PageSeoAnalyzeStatus.READY_TO_SCRAPE,
        },
        orderBy: { updated_at: 'asc' },
      });

    if (!nextAnalyze) {
      nextAnalyze = await this.db.pageSeoAnalyze.findFirst({
        where: {
          scraper_flag: PageSeoAnalyzeStatus.FAILED_TO_SCRAPE,
        },
        orderBy: { updated_at: 'asc' },
      });
      return;
    }

    if (!nextAnalyze) return;

    /* --------------------------------- scrape --------------------------------- */
    const scrapeResult = await scrape(nextAnalyze.url);
    if (!scrapeResult) {
      await this.db.pageSeoAnalyze.update({
        where: { id: nextAnalyze.id },
        data: { scraper_flag: PageSeoAnalyzeStatus.FAILED_TO_SCRAPE },
      });
      return;
    }

    await this.db.pageSeoAnalyze.update({
      where: { id: nextAnalyze.id },
      data: {
        scraper_flag: PageSeoAnalyzeStatus.SCRAPED,
        h1_count: scrapeResult.h1_count || 0,
        h1_array: scrapeResult.h1_array || [],
        h2_count: 0,
        meta_title_length: scrapeResult.title_length ?? 0,
        meta_description_length: scrapeResult.description_length ?? 0,
        canonical: scrapeResult.canonical,
        schemas: scrapeResult.schemas,
        no_alt_images: scrapeResult.images || [],
      },
    });

    const createLink: Prisma.PageSeoLinkAnalyzeCreateManyInput[] = [];
    for (const link of scrapeResult.internal_links) {
      createLink.push({
        page_id: nextAnalyze.id,
        href: link.href,
        rel: link.rel,
        is_internal: true,
      });
    }

    for (const link of scrapeResult.external_links) {
      createLink.push({
        page_id: nextAnalyze.id,
        href: link.href,
        rel: link.rel,
        is_internal: false,
      });
    }

    await this.db.pageSeoLinkAnalyze.deleteMany({ where: { page_id: nextAnalyze.id } });
    await this.db.pageSeoLinkAnalyze.createMany({ data: createLink });

    // console.log({ link: scrapeResult.internal_links });

    return;
  }

  /**
   * این متد کل سایت مپ رو میریزه توی دیتابیس
   * @returns
   */
  async syncSitemap(): Promise<PageSeoAnalyze> {
    const CACHE_KEY = 'sync:page:sitemap';
    if (await this.cacheManager.get(CACHE_KEY)) return;

    const path = __baseDir + '/storage/public/seo/sitemap.xml';
    const file = (await fs.readFile(path)).toString();
    const parser = new XMLParser({
      // ignoreAttributes: false,
      // attributeNamePrefix: '',
    });
    let obj = parser.parse(file);

    const sitemap = obj?.urlset?.url;
    if (!sitemap || isEmpty(sitemap)) return;

    for (const item of sitemap) {
      if (!item.loc) continue;

      const urlSha1 = crypto.createHash('sha1').update(item.loc).digest('hex');
      await this.db.pageSeoAnalyze.upsert({
        where: { url_sha1: urlSha1 },
        create: {
          url: item.loc,
          url_sha1: urlSha1,
          scraper_flag: PageSeoAnalyzeStatus.READY_TO_SCRAPE,
        },
        update: {},
      });
    }

    //برای جلوگیری از کال شدن پشت هم
    await this.cacheManager.set(CACHE_KEY, 'wait', TEN_MINUTES_TTL);
    return;
  }

  /**
   * همه ایتم ها رو در صف بررسی قرار میدهیم
   */
  async scrapeAll(): Promise<void> {
    await this.db.pageSeoAnalyze.updateMany({ data: { scraper_flag: PageSeoAnalyzeStatus.READY_TO_SCRAPE } });
  }

  /* -------------------------------------------------------------------------- */
  /*                                    FETCH                                   */
  /* -------------------------------------------------------------------------- */
  /**
   * find all PageSeoAnalyze
   * @param filers
   * @param page
   * @param perPage
   * @returns
   */
  async findAll(
    filters: Prisma.PageSeoAnalyzeWhereInput,
    page: number,
    perPage = 50,
  ): Promise<PaginatedResult<PageSeoAnalyze>> {
    const list = await paginate()<PageSeoAnalyze, Prisma.PageSeoAnalyzeFindManyArgs>(
      this.db.pageSeoAnalyze,
      {
        where: filters, include: { links: true },
        orderBy: { id: 'asc' },
      },
      { page, perPage },
    );

    const formatted = [];
    for (const item of list.data) {
      formatted.push({
        ...item,
        images_count: item.no_alt_images?.length || 0,
        schemas_count: item.schemas?.length || 0,
      });
    }
    return { data: formatted, meta: list.meta };
  }

  /**
   * find one pageSeoAnalyze
   * this method is used in the findOne controller to include or select items
   * @param id
   * @returns
   */
  async findOne(id: number): Promise<{ showProps: ShowProps[]; actions?: ShowAction[] }> {
    const item = await this.db.pageSeoAnalyze.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('NOT_FOUND');

    const showProps = showPropsBuilder(item);
    const actions = showActionBuilder(item);

    return { showProps, actions };
  }

  /**
   * find by id
   * @param id
   * @returns
   */
  async findById(id: number): Promise<PageSeoAnalyze> {
    const item = await this.db.pageSeoAnalyze.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('NOT_FOUND');

    return item;
  }

  /* -------------------------------------------------------------------------- */
  /*                                   HELPER                                   */
  /* -------------------------------------------------------------------------- */
  /**
   * find model props
   * @param rbac
   * @returns
   */
  async findModelProps(rbac: AccessControlList): Promise<{
    filterProps: Array<CreateProps>;
    createProps: Array<CreateProps>;
    tableProps: TableProps;
    operators: Array<OperatorItems>;
  }> {
    // ACTIONS
    const availableActions = allActionsBuilder(rbac);

    // PROPS
    const filterProps = filterPropsBuilder();
    const tableProps = tablePropsBuilder(availableActions);
    const createProps = createPropsBuilder();

    return { operators: operatorsList, filterProps, createProps, tableProps };
  }
}
