import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Advisor, Owner, Prisma, User } from '@prisma/client';
import { UserType } from 'src/common/interfaces/user.interface';
import { UpdateFcmDto, UpdateProfileDto } from 'src/profile/dto/update-profile.dto';
import { RegisterAdvisorUserDto, RegisterOwnerUserDto } from './dto/register.dto';
import { OwnerStatus } from 'src/owner/common/owner-status.type';
import { AdvisorStatus } from 'src/advisor/common/advisor-status.type';

@Injectable()
export class ProfileUserService {
  constructor(private readonly db: PrismaService) {}

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

    const owner = await this.db.owner.create({
      data: { ...dto, status: OwnerStatus.PENDING, user: { connect: { id: userId, full_name: fullName } } },
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
   * register owner
   * @param userId
   * @param dto
   * @returns
   */
  async registerAdvisor(userId: number, dto: RegisterAdvisorUserDto): Promise<Advisor> {
    const fullName = dto.full_name;
    delete dto.full_name;

    const owner = await this.db.advisor.create({
      data: {
        ...dto,
        status: AdvisorStatus.PENDING,
        cities: { connect: dto.cityIds.map((e) => ({ id: e })) },
        user: { connect: { id: userId, full_name: fullName } },
      },
    });

    return owner;
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
        created_at: true,
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
