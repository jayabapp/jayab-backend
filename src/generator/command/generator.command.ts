import { Command, Positional } from 'nestjs-command';
import { Injectable } from '@nestjs/common';
import { GeneratorCommandService } from './generator-command.service';
import {GeneratorRole} from "../common/generator-role.enum";

@Injectable()
export class GeneratorCommand {
  constructor(private readonly commandService: GeneratorCommandService) {}

  @Command({
    command: 'gen:module',
    describe: 'Generate a module',
  })
  async create(): Promise<void> {
    let persianModuleName = ''
    const modelName = await this.commandService.selectModelName();
    const roleName = await this.commandService.selectRole();
    if (roleName === GeneratorRole.ADMIN) persianModuleName = await this.commandService.persianModuleName();
    await this.commandService.create(modelName, roleName, persianModuleName);
  }
}
