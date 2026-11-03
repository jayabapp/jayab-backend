import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { ConflictException, ForbiddenException } from '@nestjs/common';
import { TestAccessMember, TestAccessRole } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TestAccessService implements OnModuleInit {
  constructor(
    private readonly db: PrismaService,
    private readonly config: ConfigService,
  ) {}

  isEnabled(): boolean {
    return this.config.get<boolean>('testAccess.enabled') === true;
  }

  private teamLeadMobile(): string | null {
    const mobile = this.config.get<string>('testAccess.teamLeadMobile')?.trim();
    return mobile && /^09\d{9}$/.test(mobile) ? mobile : null;
  }

  async onModuleInit(): Promise<void> {
    if (!this.isEnabled()) return;
    const mobile = this.teamLeadMobile();
    if (!mobile) return;

    await this.db.$transaction([
      this.db.testAccessMember.updateMany({
        where: {
          role: TestAccessRole.TEAM_LEAD,
          mobile_number: { not: mobile },
        },
        data: {
          role: TestAccessRole.QA,
          is_active: false,
          revoked_at: new Date(),
          revoked_by_mobile: mobile,
        },
      }),
      this.db.testAccessMember.upsert({
        where: { mobile_number: mobile },
        create: { mobile_number: mobile, role: TestAccessRole.TEAM_LEAD },
        update: {
          is_active: true,
          revoked_at: null,
          revoked_by_mobile: null,
          role: TestAccessRole.TEAM_LEAD,
        },
      }),
    ]);
  }

  async isAllowed(mobileNumber: string): Promise<boolean> {
    if (!this.isEnabled()) return true;
    return !!(await this.db.testAccessMember.findFirst({
      where: { mobile_number: mobileNumber, is_active: true },
      select: { id: true },
    }));
  }

  async assertAllowed(mobileNumber: string): Promise<void> {
    if (!(await this.isAllowed(mobileNumber))) throw new ForbiddenException('TEST_ACCESS_DENIED');
  }

  async isTeamLead(mobileNumber: string): Promise<boolean> {
    if (!this.isEnabled()) return false;
    return !!(await this.db.testAccessMember.findFirst({
      where: {
        mobile_number: mobileNumber,
        is_active: true,
        role: TestAccessRole.TEAM_LEAD,
      },
      select: { id: true },
    }));
  }

  async assertTeamLead(mobileNumber: string): Promise<void> {
    if (!(await this.isTeamLead(mobileNumber))) throw new ForbiddenException('TEST_ACCESS_FORBIDDEN');
  }

  async list(actorMobile: string): Promise<TestAccessMember[]> {
    await this.assertTeamLead(actorMobile);
    return this.db.testAccessMember.findMany({
      orderBy: [{ role: 'asc' }, { created_at: 'desc' }],
    });
  }

  async create(mobileNumber: string, actorMobile: string): Promise<TestAccessMember> {
    await this.assertTeamLead(actorMobile);
    if (mobileNumber === actorMobile) throw new ConflictException('TEST_ACCESS_ALREADY_EXISTS');

    return this.db.testAccessMember.upsert({
      where: { mobile_number: mobileNumber },
      create: {
        mobile_number: mobileNumber,
        role: TestAccessRole.QA,
        created_by_mobile: actorMobile,
      },
      update: {
        is_active: true,
        revoked_at: null,
        revoked_by_mobile: null,
      },
    });
  }

  async setActive(id: number, isActive: boolean, actorMobile: string): Promise<TestAccessMember> {
    await this.assertTeamLead(actorMobile);
    const member = await this.db.testAccessMember.findUnique({ where: { id } });
    if (!member) throw new NotFoundException('TEST_ACCESS_MEMBER_NOT_FOUND');
    if (member.role === TestAccessRole.TEAM_LEAD)
      throw new ForbiddenException('TEST_ACCESS_TEAM_LEAD_PROTECTED');

    return this.db.testAccessMember.update({
      where: { id },
      data: {
        is_active: isActive,
        revoked_at: isActive ? null : new Date(),
        revoked_by_mobile: isActive ? null : actorMobile,
      },
    });
  }
}
