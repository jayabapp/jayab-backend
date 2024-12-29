import { Module } from '@nestjs/common';
import { PropertyUserService } from './user/user.service';
import { PropertyOwnerController } from './owner/owner.controller';
import { PropertyUserController } from './user/user.controller';
import { PropertyOwnerService } from './owner/owner.service';

@Module({
  controllers: [PropertyUserController, PropertyOwnerController],
  providers: [PropertyUserService, PropertyOwnerService],
})
export class PropertyUserModule {}
