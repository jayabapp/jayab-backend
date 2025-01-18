import { Module } from '@nestjs/common';
import { ProfileUserController } from './profile-user.controller';
import { ProfileUserService } from './profile-user.service';
import { AttachmentModule } from 'src/attachment/attachment.module';
import { CategoryModule } from 'src/category/category.module';
import { OwnerUserModule } from 'src/owner/roles/user/user.module';
import { AdvisorUserModule } from 'src/advisor/roles/user/user.module';
import { CityModule } from 'src/city/city.module';
import { SubscriptionPlanUserModule } from 'src/subscription-plan/roles/user/user.module';
import { PaymentUserModule } from 'src/payment/roles/user/user.module';

@Module({
  imports: [
    AttachmentModule,
    CategoryModule,
    OwnerUserModule,
    AdvisorUserModule,
    CityModule,
    SubscriptionPlanUserModule,
    PaymentUserModule,
  ],
  controllers: [ProfileUserController],
  providers: [ProfileUserService],
  exports: [ProfileUserService],
})
export class ProfileUserModule {}
