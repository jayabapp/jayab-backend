import { Module } from '@nestjs/common';
import { ContentQuestionUserController } from './user.controller';
import { ContentQuestionUserService } from './user.service';

@Module({
  controllers: [ContentQuestionUserController],
  providers: [ContentQuestionUserService],
})
export class ContentQuestionUserModule {}
