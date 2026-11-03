import { Module } from '@nestjs/common';
import { TestAccessController } from './test-access.controller';
import { TestAccessService } from './test-access.service';

@Module({
  controllers: [TestAccessController],
  providers: [TestAccessService],
  exports: [TestAccessService],
})
export class TestAccessModule {}
