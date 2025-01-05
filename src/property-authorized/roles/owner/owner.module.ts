import { Module } from '@nestjs/common';
import { PropertyAuthorizedOwnerController } from './owner.controller';
import { PropertyAuthorizedOwnerService } from './owner.service';

@Module({
  controllers: [PropertyAuthorizedOwnerController],
  providers: [PropertyAuthorizedOwnerService],
})
export class PropertyAuthorizedOwnerModule {}
