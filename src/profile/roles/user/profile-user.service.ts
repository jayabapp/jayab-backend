import { BuySubscriptionAdvisorDto, RegisterAdvisorUserDto, RegisterOwnerUserDto } from './dto/register.dto';
import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { AdvisorStatus, AdvisorStatusList } from 'src/advisor/common/advisor-status.type';
import { UpdateFcmDto, UpdateProfileDto } from 'src/profile/dto/update-profile.dto';
import { Advisor, Owner, Prisma, User } from '@prisma/client';
import { OwnerStatus, OwnerStatusList } from 'src/owner/common/owner-status.type';
import { SubscriptionPlanUserService } from 'src/subscription-plan/roles/user/user.service';
import { UpdateProfileImageUserDto } from './dto/update.dto';
import { verifyUserTokenManualy } from 'src/auth/guards/verify-user-bearer';
import { PaymentUserService } from 'src/payment/roles/user/user.service';
import { SubscriptionStatus } from 'src/subscription/common/subscription-status.type';
import { PrismaService } from 'src/prisma/prisma.service';
import { startOfToday } from 'src/common/helpers/date.helper';
import { TurnoverType } from 'src/payment/common/turnover-type.enum';
import { PartialUser } from 'src/common/interfaces/user.interface';
import { last } from 'lodash';

import moment from 'moment-jalaali';
@Injectable()
export class ProfileUserService {
  constructor(
    private readonly db: PrismaService,
    private readonly subscriptionPlanUserService: SubscriptionPlanUserService,
    private readonly paymentUserService: PaymentUserService,
  ) {}

  async updateProfile(userId: number, dto: UpdateProfileDto): Promise<void> {
    await this.db.user.update({
      where: { id: userId },
      data: dto,
      include: { profile_image: true },
    });
  }

  async registerOwner(
    userId: number,
    dto: RegisterOwnerUserDto,
  ): Promise<{ owner: Owner; changed: boolean }> {
    const { full_name: fullName, ...ownerData } = dto;

    return this.db.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`owner-register-code:${ownerData.national_code}`}))`;
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`owner-register-user:${userId}`}))`;
      const user = await tx.user.findUnique({ where: { id: userId }, select: { owner_id: true } });
      if (user.owner_id) {
        const current = await tx.owner.findUnique({ where: { id: user.owner_id } });
        if (current?.national_code !== ownerData.national_code) throw new BadRequestException('REGISTER1');
        return { owner: current, changed: false };
      }

      const sameCode = await tx.owner.findMany({
        where: { national_code: ownerData.national_code },
        include: { user: { select: { id: true } } },
        orderBy: { id: 'asc' },
      });
      if (sameCode.some((e) => e.user)) throw new ConflictException('REGISTER2');
      const orphan = sameCode[0];
      const owner = orphan
        ? await tx.owner.update({ where: { id: orphan.id }, data: ownerData })
        : await tx.owner.create({ data: { ...ownerData, status: OwnerStatus.PENDING } });
      await tx.user.update({
        where: { id: userId },
        data: { full_name: fullName, profile_image_id: dto.selfie_image_id, owner_id: owner.id },
      });

      return { owner, changed: true };
    });
  }

  async validateNationalCodeWebService(owner: Owner): Promise<void> {
    await this.db.owner.update({ where: { id: owner.id }, data: { status: OwnerStatus.APPROVED } });
  }

  async registerAdvisor(user: PartialUser, dto: RegisterAdvisorUserDto): Promise<Advisor> {
    const { full_name: fullName, profile_image_id: profileImageId, referrer_code: referrerCode } = dto;
    delete dto.full_name;
    delete dto.profile_image_id;
    delete dto.referrer_code;
    let data: Prisma.AdvisorUncheckedCreateInput = {
      status: dto.is_special ? AdvisorStatus.PENDING : AdvisorStatus.APPROVED,
    };

    if (dto.is_special) {
      if (referrerCode) {
        const referrer = await this.db.user.findUnique({ where: { referral_code: referrerCode } });
        if (!referrer) throw new UnprocessableEntityException('REGISTER5');
      }
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
          referrer_code: dto.is_special ? referrerCode : null,
        },
      });

      return advisor;
    });

    return newAdvisor;
  }

  async checkCanUpdateAdvisor(user: PartialUser, isSpecial: boolean): Promise<void> {
    const advisor = await this.db.advisor.findUnique({ where: { id: user.advisor_id } });
    if (advisor.status === AdvisorStatus.APPROVED) throw new BadRequestException('REGISTER3');
  }

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

  async findAdvisorProfile(userId: number): Promise<Partial<User>> {
    let data = await this.db.advisor.findFirst({
      where: { user: { id: userId } },
      include: {
        user: { select: { full_name: true, profile_image: true, referral_code: true, referrer_code: true } },
        document_image: true,
        national_card_image: true,
        cities: true,
      },
    });

    if (data) {
      data = {
        ...data,
        user: { ...data.user, referral_code: data.is_special ? data.user.referral_code : null },
        // @ts-ignore
        admin_description: last(data.admin_descriptions)?.description,
        // @ts-ignore
        status: AdvisorStatusList.find((e) => e.id == data.status),
      };
    }
    delete data?.admin_descriptions;
    return data;
  }

  async updateFcm(userId: number, dto: UpdateFcmDto): Promise<User> {
    return await this.db.user.update({ where: { id: userId }, data: { fcm_token: dto.fcm_token } });
  }

  async payAdvisorSubscription(user: PartialUser, dto: BuySubscriptionAdvisorDto): Promise<string> {
    const advisorId = user.advisor_id;
    const advisor = await this.db.advisor.findUnique({ where: { id: advisorId } });
    const chosenSub = await this.subscriptionPlanUserService.findOne(dto.plan_id, false, true);
    const isSubExpired = moment().isAfter(advisor?.subscription_expired_at);
    if (!isSubExpired && advisor.is_special && !chosenSub.is_special)
      throw new BadRequestException('BUY_SUBSCRIPTION1');
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

  async revokeAdvisorSubscription(advisorId: number): Promise<void> {
    await this.db.advisor.update({
      where: { id: advisorId },
      data: { is_special: false },
    });
    return;
  }

  async updateProfileImage(userId: number, dto: UpdateProfileImageUserDto): Promise<Partial<User>> {
    const user = await this.db.user.findUnique({ where: { id: userId }, include: { advisor: true } });
    if (user.profile_image_id == dto.profile_image_id) return;
    const result = await this.db.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: { profile_image_id: dto.profile_image_id },
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

      if (user?.advisor?.is_special)
        await tx.advisor.update({ where: { id: user.advisor.id }, data: { status: AdvisorStatus.PENDING } });
      return updatedUser;
    });

    return result;
  }

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
    if (startOfToday().getTime() <= user?.advisor?.subscription_expired_at?.getTime())
      return { isAdvisor: true, advisorId: user.advisor.id };
    return { isAdvisor: false };
  }
}
