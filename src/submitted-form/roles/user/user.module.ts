import { Module } from '@nestjs/common';
import { SubmittedFormUserController } from './user.controller';
import { SubmittedFormUserService } from './user.service';
import { AttachmentModule } from 'src/attachment/attachment.module';

@Module({
  imports: [AttachmentModule],
  controllers: [SubmittedFormUserController],
  providers: [SubmittedFormUserService],
})
export class SubmittedFormUserModule {}
