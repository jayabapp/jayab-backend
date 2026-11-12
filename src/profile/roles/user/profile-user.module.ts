import { SubscriptionPlanUserModule } from 'src/subscription-plan/roles/user/user.module';
import { ProfileUserController } from './profile-user.controller';
import { ProfileUserService } from './profile-user.service';
import { PaymentUserModule } from 'src/payment/roles/user/user.module';
import { AdvisorUserModule } from 'src/advisor/roles/user/user.module';
import { AttachmentModule } from 'src/attachment/attachment.module';
import { OwnerUserModule } from 'src/owner/roles/user/user.module';
import { CategoryModule } from 'src/category/category.module';
import { CityModule } from 'src/city/city.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    CityModule,
    CategoryModule,
    OwnerUserModule,
    AttachmentModule,
    AdvisorUserModule,
    PaymentUserModule,
    SubscriptionPlanUserModule,
  ],
  controllers: [ProfileUserController],
  providers: [ProfileUserService],
  exports: [ProfileUserService],
})
export class ProfileUserModule {}
