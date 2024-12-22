import { Module } from '@nestjs/common';
import { GeneratorService } from './generator.service';
import { GeneratorCommandService } from './command/generator-command.service';

@Module({
  providers: [GeneratorService, GeneratorCommandService],
})
export class GeneratorModule {}
