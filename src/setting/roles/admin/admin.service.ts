import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Setting } from '@prisma/client';
import { UpdateRobotTxtDto, UpdateSettingDto } from 'src/setting/dto/update-setting.dto';

import { SettingDataType, SettingKey } from 'src/setting/common/interfaces/settings.interface';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ONE_HOUR_TTL } from 'src/common/utils/constants/cache-ttl.constant';
import { __baseDir } from 'src/config/settings';
import fs from 'fs/promises';
import { ConfigService } from '@nestjs/config';
import moment from 'moment-jalaali';
import { PropertyStatuses } from 'src/property/common/types/property-status.type';
import { startOfToday } from 'src/common/helpers/date.helper';

type Sitemap = {
  loc: string;
  lastmod: string;
  priority?: number;
  changefreq?: 'never' | 'yearly' | 'monthly' | 'weekly' | 'daily' | 'hourly' | 'always';
};
@Injectable()
export class SettingAdminService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly db: PrismaService,
    private readonly config: ConfigService,
  ) {}

  /**
   * find all settings
   * @returns
   */
  async findAll(): Promise<Array<Setting>> {
    const all = await this.db.setting.findMany({ orderBy: { sort_order: { sort: 'asc', nulls: 'last' } } });
    return all;
  }

  /**
   * Update setting by id
   * @param id
   * @param dto
   * @returns
   */
  async update(id: number, dto: UpdateSettingDto): Promise<void> {
    const setting = await this.db.setting.findFirst({ where: { id } });
    if (!setting) throw new NotFoundException('COMMON1');

    if (setting.data_type === SettingDataType.NUMBER) {
      if (isNaN(+dto.value)) throw new UnprocessableEntityException('COMMON4');
      if (setting.min >= 0 && setting.max && (+dto.value > setting.max || +dto.value < setting.min))
        throw new UnprocessableEntityException('مقدار وارد شده صحیح نیست');
    }

    await this.db.setting.update({ where: { id: id }, data: { value: dto.value } });

    /**
     * delete setting cache
     */
    await this.cacheManager.del(`setting:${setting.key}`);

    return;
  }

  /**
   * setting getter
   * cache key
   * @param key
   * @returns
   */
  async get(key: SettingKey): Promise<any> {
    const CACHE_KEY = `setting:${key}`;
    const value = await this.cacheManager.get(CACHE_KEY);
    if (value) return value;

    const setting = await this.db.setting.findFirst({ where: { key: key as unknown } });
    if (!setting) throw new BadRequestException('SETTING1');
    await this.cacheManager.set(CACHE_KEY, setting.value, ONE_HOUR_TTL);

    return setting.value;
  }

  /* -------------------------------------------------------------------------- */
  /*                                  ROBOT.TXT                                 */
  /* -------------------------------------------------------------------------- */
  /**
   * read and return robot.txt file
   * @returns
   */
  async findRobot(): Promise<any> {
    try {
      const path = __baseDir + '/storage/public/seo/robots.txt';

      //check file exist
      const isExist = await this.fileExists(path);

      if (!isExist) {
        await fs.writeFile(
          path,
          `User-agent: *
Allow: *
`,
        );
      }

      const file = (await fs.readFile(path)).toString();

      return file;
    } catch (error) {
      throw new NotFoundException('');
    }
  }

  async updateRobot(dto: UpdateRobotTxtDto): Promise<any> {
    const path = __baseDir + '/storage/public/seo/robots.txt';

    //check file exist
    const isExist = await this.fileExists(path);
    if (!isExist) {
      await fs.writeFile(path, 'User-agent: *\nAllow: *');
    }

    const file = await fs.writeFile(path, dto.robot_text);

    return file;
  }

  /* -------------------------------------------------------------------------- */
  /*                                   SITEMAP                                  */
  /* -------------------------------------------------------------------------- */
  async generateSitemap(): Promise<any> {
    try {
      const path = __baseDir + '/storage/public/seo/sitemap.xml';

      const xml = await this.initSitemap();
      await fs.writeFile(path, xml);

      const file = (await fs.readFile(path)).toString();

      return file;
    } catch (error) {
      throw new NotFoundException('');
    }
  }

  /**
   * create required tags
   * @returns
   */
  async initSitemap(): Promise<any> {
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
<!--  created with Kian Sitemap Generator www.kiantc.com  -->
`;
    const sitemapInJson = await this.generateContentSitemap();
    for (const item of sitemapInJson) {
      xml += `
<url>      
  <loc>${item.loc}</loc>  
  <lastmod>${item.lastmod}</lastmod>
  <priority>${item.priority}</priority>
  <changefreq>${item.changefreq}</changefreq>
</url>  
  `;
    }

    xml += `
</urlset>`;

    return xml;
  }

  /**
   * Read database and create data json
   * @returns
   */
  async generateContentSitemap(): Promise<Sitemap[]> {
    const contents = await this.db.content.findMany({
      where: { show_in_sitemap: true, slug: { not: null } },
    });
    const contentCategory = await this.db.contentCategory.findMany({
      where: { show_in_sitemap: true },
    });
    const properties = await this.db.property.findMany({
      where: { status: PropertyStatuses.PUBLISHED, subscription_expired_at: { gte: startOfToday() } },
      select: { slug: true, updated_at: true },
    });

    const siteUrl = this.config.get('url.websiteUrl');

    const sitemap: Sitemap[] = [];

    sitemap.push({ loc: siteUrl, lastmod: moment().toISOString(), priority: 1.0, changefreq: 'never' });
    sitemap.push({
      loc: `${siteUrl}/about-us`,
      lastmod: moment().toISOString(),
      priority: 0.8,
      changefreq: 'weekly',
    });
    sitemap.push({
      loc: `${siteUrl}/contact-us`,
      lastmod: moment().toISOString(),
      priority: 0.8,
      changefreq: 'weekly',
    });
    sitemap.push({
      loc: `${siteUrl}/blog?page=1`,
      lastmod: moment().toISOString(),
      priority: 0.8,
      changefreq: 'daily',
    });
    sitemap.push({
      loc: `${siteUrl}/faq`,
      lastmod: moment().toISOString(),
      priority: 0.8,
      changefreq: 'daily',
    });
    sitemap.push({
      loc: `${siteUrl}/terms`,
      lastmod: moment().toISOString(),
      priority: 1.0,
      changefreq: 'daily',
    });

    for (const content of contents) {
      //@ts-ignore
      const route = content.seo?.sitemap_url || ''; //روت بین اسلاگ و دامنه اصلی
      //@ts-ignore
      const slug = content.seo?.is_url_without_slug?.id === '1' ? '' : content.slug; //برای بعضی ها مثل درباره ما باید بدون اسلاگ باشه
      //@ts-ignore
      const priority = content.seo?.priority || 0.8;
      //@ts-ignore
      const changefreq = content.seo?.sitemap_change_freq?.id || 'monthly';

      sitemap.push({
        loc: `${siteUrl}${route ? `/${route}` : ''}${slug ? `/${slug}` : ''}`,
        lastmod: moment(content.updated_at).toISOString(),
        priority,
        changefreq,
      });
    }

    for (const cat of contentCategory) {
      sitemap.push({
        loc: `${siteUrl}/${cat.key}`,
        lastmod: moment(cat.updated_at).toISOString(),
        priority: 0.8,
        changefreq: 'weekly',
      });
    }

    for (const p of properties) {
      sitemap.push({
        loc: `${siteUrl}/rooms/${p.slug}`,
        lastmod: moment(p.updated_at).toISOString(),
        priority: 0.8,
        changefreq: 'weekly',
      });
    }

    return sitemap;
  }

  /* --------------------------------- HELPERS -------------------------------- */
  async fileExists(path: string): Promise<boolean> {
    try {
      await fs.stat(path);
      return true;
    } catch (error) {
      return false;
    }
  }
}
