import { Module } from '@nestjs/common';
import { BaseUserController } from './user.controller';
import { BaseUserService } from './user.service';

@Module({
  controllers: [BaseUserController],
  providers: [BaseUserService],
})
export class BaseUserModule {}
