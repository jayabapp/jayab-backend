import { Injectable } from '@nestjs/common';
import { Admin } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProfileAdminService {
  constructor(private readonly db: PrismaService) {}

  async profile(adminId: number): Promise<Partial<Admin>> {
    const admin = await this.db.admin.findFirst({
      where: { id: adminId },
      select: { role_id: true, full_name: true, id: true },
    });
    return admin;
  }
}
