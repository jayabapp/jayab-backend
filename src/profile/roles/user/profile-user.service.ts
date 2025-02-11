import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Advisor, Owner, Prisma, User } from '@prisma/client';
import { PartialUser, UserType } from 'src/common/interfaces/user.interface';
import { UpdateFcmDto, UpdateProfileDto } from 'src/profile/dto/update-profile.dto';
import { BuySubscriptionAdvisorDto, RegisterAdvisorUserDto, RegisterOwnerUserDto } from './dto/register.dto';
import { OwnerStatus, OwnerStatusList } from 'src/owner/common/owner-status.type';
import { AdvisorStatus, AdvisorStatusList } from 'src/advisor/common/advisor-status.type';
import { first, last } from 'lodash';
import { SubscriptionPlanUserService } from 'src/subscription-plan/roles/user/user.service';
import moment from 'moment-jalaali';
import { PaymentUserService } from 'src/payment/roles/user/user.service';
import { TurnoverType } from 'src/payment/common/turnover-type.enum';
import { PaymentStatuses } from 'src/payment/common/payment-status.enum';
import { SubscriptionStatus } from 'src/subscription/common/subscription-status.type';
import { verifyUserTokenManualy } from 'src/auth/guards/verify-user-bearer';
import { startOfToday } from 'src/common/helpers/date.helper';
import { JALAALI_FORMAT } from 'src/common/utils/constants/date.constant';

@Injectable()
export class ProfileUserService {
  constructor(
    private readonly db: PrismaService,
    private readonly subscriptionPlanUserService: SubscriptionPlanUserService,
    private readonly paymentUserService: PaymentUserService,
  ) {}

  /**
   * Update profile
   * @param dto
   * @param userId
   * @returns
   */
  async updateProfile(userId: number, dto: UpdateProfileDto): Promise<void> {
    await this.db.user.update({
      where: { id: userId },
      data: dto,
      include: { profile_image: true },
    });
  }

  /* -------------------------------------------------------------------------- */
  /**
   * register owner
   * @param userId
   * @param dto
   * @returns
   */
  async registerOwner(userId: number, dto: RegisterOwnerUserDto): Promise<Owner> {
    const fullName = dto.full_name;
    delete dto.full_name;

    const owner = await this.db.owner.create({ data: { ...dto, status: OwnerStatus.PENDING } });

    await this.db.user.update({
      where: { id: userId },
      data: { id: userId, full_name: fullName, profile_image_id: dto.selfie_image_id, owner_id: owner.id },
    });

    return owner;
  }

  /**
   *
   * @param nationalCode
   */
  async validateNationalCodeWebService(owner: Owner): Promise<void> {
    // TODO: web service

    // update the owner status
    await this.db.owner.update({ where: { id: owner.id }, data: { status: OwnerStatus.APPROVED } });
  }
  /* -------------------------------------------------------------------------- */
  /**
   * register advisor
   * @param userId
   * @param dto
   * @returns
   */
  async registerAdvisor(user: PartialUser, dto: RegisterAdvisorUserDto): Promise<Advisor> {
    const fullName = dto.full_name;
    const profileImageId = dto.profile_image_id;
    delete dto.full_name;
    delete dto.profile_image_id;

    /*  */
    let data: Prisma.AdvisorUncheckedCreateInput = {
      status: dto.is_special ? AdvisorStatus.PENDING : AdvisorStatus.APPROVED,
    };

    if (dto.is_special) {
      const cityIds = dto.cityIds.map((e) => ({ id: e }));
      delete dto.cityIds;
      data = { ...data, ...dto, cities: { connect: cityIds } };
    }

    const newAdvisor = await this.db.$transaction(async (tx) => {
      let advisor: Advisor;
      if (user.advisor_id) advisor = await tx.advisor.update({ where: { id: user.advisor_id }, data });
      else advisor = await tx.advisor.create({ data });

      await tx.user.update({
        where: { id: user.id },
        data: {
          full_name: fullName,
          profile_image_id: profileImageId,
          advisor_id: advisor.id,
        },
      });

      return advisor;
    });

    return newAdvisor;
  }

  async checkCanUpdateAdvisor(user: PartialUser, isSpecial: boolean): Promise<void> {
    const advisor = await this.db.advisor.findUnique({ where: { id: user.advisor_id } });
    // if (advisor.is_special && isSpecial) throw new BadRequestException('REGISTER1');
    if (advisor.status === AdvisorStatus.APPROVED) throw new BadRequestException('REGISTER3');
  }

  /**
   * Get user profile
   * @param userId
   * @returns
   */
  async findOne(userId: number): Promise<Partial<User>> {
    const data = await this.db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        mobile_number: true,
        full_name: true,
        profile_image: true,
        owner_id: true,
        advisor_id: true,
        created_at: true,
        fcm_token: true,
        advisor: { select: { is_special: true } },
      },
    });

    return data;
  }

  /**
   * Get user profile
   * @param userId
   * @returns
   */
  async findOwnerProfile(userId: number): Promise<Partial<User>> {
    let data = await this.db.owner.findFirst({
      where: { user: { id: userId } },
      select: {
        id: true,
        status: true,
        admin_descriptions: true,
        national_code: true,
        created_at: true,
        user: {
          select: { full_name: true },
        },
        selfie_image: true,
      },
    });

    if (data) {
      data = {
        ...data,
        // @ts-ignore
        admin_description: last(data.admin_descriptions)?.description,
        // @ts-ignore
        status: OwnerStatusList.find((e) => e.id == data.status),
      };
    }

    delete data?.admin_descriptions;

    return data;
  }

  /**
   * Get advisor profile
   * @param userId
   * @returns
   */
  async findAdvisorProfile(userId: number): Promise<Partial<User>> {
    let data = await this.db.advisor.findFirst({
      where: { user: { id: userId } },
      select: {
        id: true,
        user: { select: { full_name: true } },
        status: true,
        admin_descriptions: true,
        is_special: true,
        subscription_expired_at: true,
        national_code: true,
      },
    });

    if (data) {
      data = {
        ...data,
        // @ts-ignore
        admin_description: last(data.admin_descriptions)?.description,
        // @ts-ignore
        status: AdvisorStatusList.find((e) => e.id == data.status),
      };
    }

    delete data?.admin_descriptions;

    return data;
  }

  /**
   * Update fcm token
   * @param user
   * @param dto
   * @returns
   */
  async updateFcm(userId: number, dto: UpdateFcmDto): Promise<User> {
    return await this.db.user.update({ where: { id: userId }, data: { fcm_token: dto.fcm_token } });
  }

  /**
   *
   * @param user
   * @param dto
   * @returns
   */
  async payAdvisorSubscription(user: PartialUser, dto: BuySubscriptionAdvisorDto): Promise<string> {
    /*  */
    const advisorId = user.advisor_id;
    const advisor = await this.db.advisor.findUnique({ where: { id: advisorId } });

    /*  */
    const chosenSub = await this.subscriptionPlanUserService.findOne(dto.plan_id, false, true);

    /**
     * آپدیت به ویژه داریم ولی برعکس قابل انجام نیست
     * مگر اینکه اشتراک ویژه کاربر تمام شده باشد
     * اگر اشتراک منقضی نباشه قطعا کاربر اشتراک فعال داره
     * !اگر اشتراک باقی مونده باشه و نیاز به تمدید باشه در کال بک پرداخت اینو چک میکنیم
     */
    const isSubExpired = moment().isAfter(advisor?.subscription_expired_at);
    if (!isSubExpired && advisor.is_special && !chosenSub.is_special)
      throw new BadRequestException('BUY_SUBSCRIPTION1');

    /*  */
    const isSpecialSub = chosenSub?.is_special;

    const pay = await this.db.$transaction(async (tx) => {
      await tx.subscription.deleteMany({
        where: { advisor_id: advisorId, status: SubscriptionStatus.WAITING },
      });

      const price = chosenSub?.price_with_discount || chosenSub.price;
      const pay = await this.paymentUserService.create(
        user,
        price,
        dto.redirect_url,
        dto.gateway,
        TurnoverType.PAY_ADVISOR_SUBSCRIPTION,
        tx,
      );

      await tx.subscription.create({
        data: {
          advisor_id: advisorId,
          is_special_advisor: isSpecialSub,
          status: SubscriptionStatus.WAITING,
          title: chosenSub.title,
          duration: chosenSub.duration,
          price: price,
          payment_id: pay.payment.id,
        },
      });

      return pay;
    });

    return pay.paymentUrl;
  }

  /**
   * لغو اشتراک
   * فعلا فقط از حالت ویژه خارجش میکنیم
   * @param advisorId
   * @returns
   */
  async revokeAdvisorSubscription(advisorId: number): Promise<void> {
    // const sub = await this.db.subscription.findFirst({
    //   where: { advisor_id: advisorId, status: SubscriptionStatus.SUCCESS },
    //   orderBy: { id: 'desc' },
    // });

    // if (!sub) throw new NotFoundException('SUBSCRIPTION1');

    // await this.db.subscription.update({
    //   where: { id: sub.id },
    //   data: {
    //     status: SubscriptionStatus.REVOKED,
    //     description: `${sub.description} \n لغو شده توسط کاربر در تاریخ ${moment().format(JALAALI_FORMAT)}`,
    //   },
    // });

    await this.db.advisor.update({
      where: { id: advisorId },
      data: { is_special: false },
    });

    return;
  }

  /* --------------------------------- HELPERS -------------------------------- */
  async findUserByMobile(mobile: string): Promise<User> {
    const user = await this.db.user.findFirst({ where: { mobile_number: mobile } });
    if (!user) throw new NotFoundException('NOT_FOUND');
    return user;
  }

  async findOneById(userId: number, includes?: Prisma.UserInclude): Promise<User> {
    return await this.db.user.findUnique({
      where: { id: userId },
      include: includes || {},
    });
  }

  async checkUserIsActiveAdvisor(
    authorization: string,
    explicitUserId?: number,
  ): Promise<{ isAdvisor: boolean; advisorId?: number }> {
    const token = authorization ? authorization?.split(' ')?.[1] : null;
    let userId;

    if (explicitUserId) userId = explicitUserId;
    else if (token) {
      const payload = await verifyUserTokenManualy(token);
      if (!payload) return { isAdvisor: false };

      userId = payload.id;
    } else return { isAdvisor: false };

    const user = await this.db.user.findUnique({
      where: { id: userId },
      select: {
        advisor: { select: { id: true, subscription_expired_at: true, is_special: true, status: true } },
      },
    });

    if (!user?.advisor) return { isAdvisor: false };
    if (user.advisor.status !== AdvisorStatus.APPROVED) return { isAdvisor: false };

    if (startOfToday().getTime() <= user?.advisor?.subscription_expired_at?.getTime()) {
      return { isAdvisor: true, advisorId: user.advisor.id };
    }
    return { isAdvisor: false };
  }
}
