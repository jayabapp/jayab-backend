import { Module } from '@nestjs/common';
import { PropertyReportUserController } from './user.controller';
import { PropertyReportUserService } from './user.service';

@Module({
  controllers: [PropertyReportUserController],
  providers: [PropertyReportUserService],
})
export class PropertyReportUserModule {}
