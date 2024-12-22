import { Module } from '@nestjs/common';
import { ContentSharedController } from './shared.controller';
import { ContentSharedService } from './shared.service';

@Module({
  controllers: [ContentSharedController],
  providers: [ContentSharedService],
})
export class ContentSharedModule {}
