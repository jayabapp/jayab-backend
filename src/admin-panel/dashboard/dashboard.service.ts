import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { DashboardElement } from '../common/interface/dashboard-element.type';
import { random } from 'lodash';

@Injectable()
export class DashboardService {
  constructor(private readonly db: PrismaService) {}

  async findAll(): Promise<DashboardElement[]> {
    const admins = await this.db.admin.count();
    const users = await this.db.user.count();
    const banners = await this.db.banner.count({ where: { is_active: true } });

    const elements: DashboardElement[] = [
      {
        id: random(0, 1000000),
        title: 'اطلاعات پایه',
        type: 'divider',
        value: '',
      },

      /* ----------------------------------- USER ---------------------------------- */
      {
        id: random(0, 1000000),
        title: 'کـــاربران',
        type: 'divider',
        value: '',
      },
      {
        id: random(0, 1000000),
        title: 'تعــداد کـــاربران',
        value: users,
      },
      /* ----------------------------------- ACL ---------------------------------- */
      {
        id: random(0, 1000000),
        title: 'سطـوح دستـرسی',
        type: 'divider',
        value: '',
      },
      {
        id: random(0, 1000000),
        title: 'تعداد مدیران',
        sub_title: '',
        value: admins,
        route: '/acl/admins',
      },
      /* ---------------------------------- INFO ---------------------------------- */
      {
        id: random(0, 1000000),
        title: 'اطلاعات تکمیلی',
        type: 'divider',
        value: '',
      },

      {
        id: random(0, 1000000),
        title: 'تعداد بنرها',
        sub_title: 'بنرهای فعال',
        value: banners,
        route: '/banners',
      },
    ];
    return elements;
  }
  async findAllForBusiness(): Promise<DashboardElement[]> {
    const elements: DashboardElement[] = [
      {
        id: random(0, 1000000),
        title: 'اطلاعات پایه',
        type: 'divider',
        value: '',
      },
      // {
      //   id: random(0, 1000000),
      //   title: 'تعداد کل محصولات',
      //   value: businessProducts,
      //   route: '/business-products',
      // },
    ];
    return elements;
  }

  async findCount(): Promise<object> {
    const users = await this.db.user.count();

    return {
      users,
    };
  }
}
