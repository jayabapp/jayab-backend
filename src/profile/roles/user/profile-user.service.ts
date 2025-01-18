import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Advisor, Owner, Prisma, User } from '@prisma/client';
import { PartialUser, UserType } from 'src/common/interfaces/user.interface';
import { UpdateFcmDto, UpdateProfileDto } from 'src/profile/dto/update-profile.dto';
import { BuySubscriptionAdvisorDto, RegisterAdvisorUserDto, RegisterOwnerUserDto } from './dto/register.dto';
import { OwnerStatus } from 'src/owner/common/owner-status.type';
import { AdvisorStatus } from 'src/advisor/common/advisor-status.type';
import { first } from 'lodash';
import { SubscriptionPlanUserService } from 'src/subscription-plan/roles/user/user.service';
import moment from 'moment-jalaali';
import { AdvisorSubscription } from 'src/profile/common/advisor-subscription.type';
import { PaymentUserService } from 'src/payment/roles/user/user.service';
import { TurnoverType } from 'src/payment/common/turnover-type.enum';
import { PaymentStatuses } from 'src/payment/common/payment-status.enum';

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
  async registerAdvisor(userId: number, dto: RegisterAdvisorUserDto): Promise<Advisor> {
    const fullName = dto.full_name;
    delete dto.full_name;
    let data: Prisma.AdvisorUncheckedCreateInput = { status: AdvisorStatus.PENDING };

    if (dto.is_special) {
      const cityIds = dto.cityIds.map((e) => ({ id: e }));
      delete dto.cityIds;
      delete dto.profile_image_id;
      data = { ...data, ...dto, cities: { connect: cityIds } };
    }

    const newAdvisor = await this.db.$transaction(async (tx) => {
      const advisor = await tx.advisor.create({ data });

      await tx.user.update({
        where: { id: userId },
        data: {
          id: userId,
          full_name: fullName,
          profile_image_id: dto.profile_image_id,
          advisor_id: advisor.id,
        },
      });

      return advisor;
    });

    return newAdvisor;
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
    const data = await this.db.owner.findFirst({
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

    return data;
  }

  /**
   * Update fcm token
   * @param user
   * @param dto
   * @returns
   */
  async updateFcm(user: UserType, dto: UpdateFcmDto): Promise<void> {
    await this.db.user.update({ where: { id: user.id }, data: { fcm_token: dto.fcm_token } });
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
        where: { advisor_id: advisorId, status: AdvisorSubscription.WAITING },
      });

      const pay = await this.paymentUserService.create(
        user,
        chosenSub.price,
        dto.redirect_url,
        dto.gateway,
        TurnoverType.PAY_ADVISOR_SUBSCRIPTION,
        tx,
      );

      await tx.subscription.create({
        data: {
          advisor_id: advisorId,
          is_special_advisor: isSpecialSub,
          status: AdvisorSubscription.WAITING,
          title: chosenSub.title,
          duration: chosenSub.duration,
          price: chosenSub.price,
          payment_id: pay.payment.id,
        },
      });

      return pay;
    });

    return pay.paymentUrl;
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

  // maskCriticalData(text: string, from: number, to: number): string {
  //   if (!text) return '';

  //   let maskArray: string[] = text?.split('')?.map((char, i) => {
  //     if (i < from || i > to) return char;
  //     return '*';
  //   });
  //   const masked: string = maskArray.join('');

  //   return masked;
  // }
}
