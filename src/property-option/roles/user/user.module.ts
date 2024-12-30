import { Module } from '@nestjs/common';
import { PropertyOptionUserController } from './user.controller';
import { PropertyOptionUserService } from './user.service';

@Module({
  controllers: [PropertyOptionUserController],
  providers: [PropertyOptionUserService],
})
export class PropertyOptionUserModule {}
