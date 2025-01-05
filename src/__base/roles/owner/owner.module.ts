import { Module } from '@nestjs/common';
import { BaseOwnerController } from './owner.controller';
import { BaseOwnerService } from './owner.service';

@Module({
  controllers: [BaseOwnerController],
  providers: [BaseOwnerService],
})
export class BaseOwnerModule {}
