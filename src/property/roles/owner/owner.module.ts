import { Module } from '@nestjs/common';
import { PropertyOwnerService } from './owner.service';
import { PropertyOwnerController } from './owner.controller';
import { AttachmentModule } from 'src/attachment/attachment.module';

@Module({
  imports: [AttachmentModule],
  controllers: [PropertyOwnerController],
  providers: [PropertyOwnerService],
})
export class PropertyOwnerModule {}
