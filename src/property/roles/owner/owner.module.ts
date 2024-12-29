import { Module } from '@nestjs/common';
import { PropertyOwnerService } from './owner.service';
import { PropertyOwnerController } from './owner.controller';

@Module({
  controllers: [PropertyOwnerController],
  providers: [PropertyOwnerService],
})
export class PropertyOwnerModule {}
