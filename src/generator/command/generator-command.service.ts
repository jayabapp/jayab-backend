import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import consola from 'consola';
import { GeneratorService } from '../generator.service';
import { GeneratorRole } from '../common/generator-role.enum';

@Injectable()
export class GeneratorCommandService {
  constructor(private readonly generatorService: GeneratorService) {}

  async create(modelName: string, roleName: GeneratorRole, persianModuleName: string): Promise<any> {
    if (!modelName || !roleName) {
      consola.error('Wrong args');
      return;
    }

    consola.start(`Building module...`);

    await this.generatorService.createModule(modelName, roleName, persianModuleName);

    consola.ready(`CREATE - ${modelName} module `);

    consola.success('DONE');
  }

  async selectModelName(): Promise<string> {
    const models = Prisma.dmmf.datamodel.models.flatMap((e) => e.name);

    const modelName = await consola.prompt(`Select the model name`, {
      type: 'select',
      options: models,
    });

    if (typeof modelName === 'symbol' || !models.includes(modelName)) {
      consola.error('It is required to select the name of the model');
      throw '';
    }

    return modelName;
  }

  async selectRole(): Promise<GeneratorRole> {
    const roles = [GeneratorRole.ADMIN, GeneratorRole.USER, GeneratorRole.OWNER];

    const roleName = await consola.prompt(`Select the role name`, {
      type: 'select',
      options: roles,
    });

    if (typeof roleName === 'symbol' || !roles.includes(roleName)) {
      consola.error('It is required to select the name of the role');
      throw '';
    }

    consola.log('\n');

    return roleName;
  }

  async persianModuleName(): Promise<string> {
    consola.warn('Attention. Sensitive input.');
    let persianModuleName: string;

    while (true) {
      persianModuleName = await consola.prompt(`Write the persian module name. (Use Persian alphabets)`, {
        type: 'text',
      });

      const p = /^[\u0600-\u06FF\s]+$/;
      if (typeof persianModuleName === 'symbol') throw '';

      if (!p.test(persianModuleName)) {
        consola.error('Wrong persian alphabets, try again!');
        continue;
      }

      const ans = await consola.prompt(`Are you sure?`, {
        type: 'confirm',
      });

      if (ans) break;
    }

    consola.log('\n');

    return persianModuleName;
  }
}
