import { Module } from '@nestjs/common';
import { PropertyAuthorizeOwnerController } from './owner.controller';
import { PropertyAuthorizeOwnerService } from './owner.service';

@Module({
  controllers: [PropertyAuthorizeOwnerController],
  providers: [PropertyAuthorizeOwnerService],
})
export class PropertyAuthorizeOwnerModule {}
