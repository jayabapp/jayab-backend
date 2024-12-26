import { Module } from '@nestjs/common';
import { AdvisorUserController } from './user.controller';
import { AdvisorUserService } from './user.service';

@Module({
  controllers: [AdvisorUserController],
  providers: [AdvisorUserService],
  exports: [AdvisorUserService],
})
export class AdvisorUserModule {}
