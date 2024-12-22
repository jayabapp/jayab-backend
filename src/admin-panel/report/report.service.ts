import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AdminReportDto } from './dto/admin-report.dto';

@Injectable()
export class ReportService {
  constructor(
    private readonly db: PrismaService,
    // private readonly turnoverAdminService: TurnoverAdminService,
  ) {}

  async findSaleReport(dto: AdminReportDto, businessId: number): Promise<any> {}

  /* --------------------------------- HELPERS -------------------------------- */
  createQuery(dto: AdminReportDto, businessId: number): any {}
}
