import { Module } from '@nestjs/common';
import { NotificationUserController } from './user.controller';
import { NotificationUserService } from './user.service';
import { NotificationSharedModule } from '../shared/shared.module';

@Module({
  imports: [NotificationSharedModule],
  controllers: [NotificationUserController],
  providers: [NotificationUserService],
})
export class NotificationUserModule {}
