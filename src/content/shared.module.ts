import { Module } from '@nestjs/common';
import { ContentSharedController } from './shared.controller';
import { ContentSharedService } from './shared.service';

@Module({
  controllers: [ContentSharedController],
  providers: [ContentSharedService],
  exports: [ContentSharedService],
})
export class ContentSharedModule {}
