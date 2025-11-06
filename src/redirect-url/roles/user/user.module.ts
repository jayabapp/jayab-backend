import { Module } from '@nestjs/common';
import { RedirectUrlUserController } from './user.controller';
import { RedirectUrlUserService } from './user.service';

@Module({
  controllers: [RedirectUrlUserController],
  providers: [RedirectUrlUserService],
})
export class RedirectUrlUserModule {}
