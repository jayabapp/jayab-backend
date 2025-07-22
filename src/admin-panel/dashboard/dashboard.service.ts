import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { DashboardElement } from '../common/interface/dashboard-element.type';
import { random } from 'lodash';
import { OwnerStatus } from 'src/owner/common/owner-status.type';
import { AdvisorStatus } from 'src/advisor/common/advisor-status.type';
import { SubscriptionStatus } from 'src/subscription/common/subscription-status.type';
import { TicketCommonStatuses } from 'src/ticket/common/ticket-status.constant';
import { PropertyStatuses } from 'src/property/common/types/property-status.type';
import { PropertyAuthorizeStatuses } from 'src/property-authorize/common/property-authorize-status.type';
import { PropertyBadgeStatus } from 'src/property-badge/common/property-badge-status.type';

@Injectable()
export class DashboardService {
  constructor(private readonly db: PrismaService) {}

  async findAll(): Promise<DashboardElement[]> {
    const admins = await this.db.admin.count();
    const users = await this.db.user.count();
    const banners = await this.db.banner.count({ where: { is_active: true } });

    const owners = await this.db.owner.count();
    const advisors = await this.db.advisor.count();
    const properties = await this.db.property.count();
    const authedProperties = await this.db.property.count({ where: { is_authorized: true } });
    const blueProperties = await this.db.property.count({ where: { has_blue_tick: true } });
    const tickets = await this.db.ticket.count();
    const subs = await this.db.subscription.count({ where: { status: SubscriptionStatus.SUCCESS } });

    const pendingOwners = await this.db.owner.count({ where: { status: OwnerStatus.PENDING } });
    const pendingAdvisors = await this.db.advisor.count({ where: { status: AdvisorStatus.PENDING } });
    const pendingTickets = await this.db.ticket.count({ where: { status: TicketCommonStatuses.WAITING } });
    const WaitingProperties = await this.db.property.count({ where: { status: PropertyStatuses.WAITING } });
    const WaitingAuthorize = await this.db.propertyAuthorize.count({
      where: { status: PropertyAuthorizeStatuses.PENDING },
    });
    const WaitingBlueTick = await this.db.propertyBadge.count({
      where: { status: PropertyBadgeStatus.PENDING },
    });

    const elements: DashboardElement[] = [
      { id: random(0, 1000000), title: 'اطلاعات پایه', type: 'divider', value: '' },
      { id: random(0, 1000000), title: 'تعداد کـــاربران', sub_title: 'مجموع کل', value: users },
      { id: random(0, 1000000), title: 'تعداد مالکان', sub_title: 'مجموع کل', value: owners },
      { id: random(0, 1000000), title: 'تعداد مشاوران', sub_title: 'مجموع کل', value: advisors },
      { id: random(0, 1000000), title: 'تعداد ملک‌ها', sub_title: 'مجموع کل', value: properties },
      {
        id: random(0, 1000000),
        title: 'تعداد ملک های احراز شده',
        sub_title: 'مجموع کل',
        value: authedProperties,
      },
      {
        id: random(0, 1000000),
        title: 'تعداد ملک های ممتاز',
        sub_title: 'مجموع کل',
        value: blueProperties,
      },
      {
        id: random(0, 1000000),
        title: 'تعداد تیکت ها',
        sub_title: 'مجموع کل',
        value: tickets,
      },
      {
        id: random(0, 1000000),
        title: 'تعداد اشتراک های خریداری شده',
        sub_title: 'مجموع کل',
        value: subs,
      },

      /* --------------------------------- owners --------------------------------- */
      { id: random(0, 1000000), title: 'نیاز به بررسی', type: 'divider', value: '' },
      {
        id: random(0, 1000000),
        title: 'مشاوران در انتظار بررسی',
        sub_title: 'ثبت نام',
        value: pendingAdvisors,
        route: '/advisors?status=10',
      },
      {
        id: random(0, 1000000),
        title: 'مالکان در انتظار بررسی اکانت',
        sub_title: 'ثبت نام',
        value: pendingOwners,
        route: '/owners?status=10',
      },
      {
        id: random(0, 1000000),
        title: 'تعداد تیکت ها',
        sub_title: 'در انتظار پاسخ',
        value: pendingTickets,
        route: '/tickets?status=1',
      },
      {
        id: random(0, 1000000),
        title: 'تعداد ملک ها',
        sub_title: 'در انتظار بررسی',
        value: WaitingProperties,
        route: '/properties?status=20',
      },
      {
        id: random(0, 1000000),
        title: 'تعداد ملک ها',
        sub_title: 'در انتظار بررسی احراز',
        value: WaitingAuthorize,
        route: '/property-authorize?status=20',
      },
      {
        id: random(0, 1000000),
        title: 'تعداد ملک ها',
        sub_title: 'در انتظار بررسی ممتازی',
        value: WaitingBlueTick,
        route: '/property-badges?status=20',
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

  async findAllSidebarBadge(): Promise<any> {
    const waitingProperties = await this.db.property.count({ where: { status: PropertyStatuses.WAITING } });
    const editedProperties = await this.db.property.count({ where: { status: PropertyStatuses.EDITED } });
    const pendingOwnersOwners = await this.db.owner.count({ where: { status: OwnerStatus.PENDING } });

    return {
      waitingProperties,
      editedProperties,
      pendingOwnersOwners,
    };
  }
}
