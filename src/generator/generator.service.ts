import { BadRequestException, Injectable } from '@nestjs/common';
import fs from 'fs/promises';
const __baseDir = process.env.PWD;
import shell from 'shelljs';
import { camelCase, kebabCase } from 'lodash';
import { Prisma } from '@prisma/client';
import { GeneratorRole } from './common/generator-role.enum';
import { LOREM_IPSUM_TITLE } from 'src/common/utils/constants/faker.constant';
import pluralize from 'pluralize';

@Injectable()
export class GeneratorService {
  /**
   * create module crud by role and model name
   * @param model
   * @param role
   * @param persianModuleName
   * @returns
   */
  async createModule(model: string, role: GeneratorRole, persianModuleName: string): Promise<string> {
    /* -------------------------------------------------------------------------- */
    /*                                REQUIREMENTS                                */
    /* -------------------------------------------------------------------------- */
    if (!model) throw new BadRequestException('Model is required');
    if (!role) throw new BadRequestException('Role is required');
    if (role === GeneratorRole.ADMIN && !persianModuleName) throw new BadRequestException('Name is required');
    if (!this.validateModelName(model)) throw new BadRequestException('Wrong model name');

    const { pascalCaseModel, kebabCaseModel } = this.createModelCases(model);

    /* -------------------------------------------------------------------------- */
    /*                                 BASE MODULE                                */
    /* -------------------------------------------------------------------------- */
    this.createBase(model, role);
    const destination = __baseDir + `/src/${kebabCaseModel}`;
    shell.cd(destination);

    /* -------------------------------------------------------------------------- */
    /*                                 ROUTE GROUP                                */
    /* -------------------------------------------------------------------------- */
    await this.copyRouteGroup(destination, model);

    /* -------------------------------------------------------------------------- */
    /*                                 MODEL PROPS                                */
    /* -------------------------------------------------------------------------- */
    await this.copyModelPropsHelper(destination, model);

    /* -------------------------------------------------------------------------- */
    /*                                 CONTROLLER                                 */
    /* -------------------------------------------------------------------------- */
    await this.copyController(destination, model, role);

    /* -------------------------------------------------------------------------- */
    /*                                   SERVICE                                  */
    /* -------------------------------------------------------------------------- */
    await this.copyService(destination, model, role);

    /* -------------------------------------------------------------------------- */
    /*                                 MAIN MODULE                                */
    /* -------------------------------------------------------------------------- */
    await this.copyMainModule(destination, model, role);

    /* -------------------------------------------------------------------------- */
    /*                                 ROLE MODULE                                */
    /* -------------------------------------------------------------------------- */
    await this.copyRoleModule(destination, model, role);

    /* -------------------------------------------------------------------------- */
    /*                                     DTO                                    */
    /* -------------------------------------------------------------------------- */
    await this.createDto(model, role);

    /* -------------------------------------------------------------------------- */
    /*                                ADMIN FILTER                                */
    /* -------------------------------------------------------------------------- */
    if (role == GeneratorRole.ADMIN) await this.copyAdminFilter(destination, model);

    /* -------------------------------------------------------------------------- */
    /*                                 APP MODULE                                 */
    /* -------------------------------------------------------------------------- */
    await this.fixAppModule(model);

    /* -------------------------------------------------------------------------- */
    /*                                 RUN SEEDER                                 */
    /* -------------------------------------------------------------------------- */
    role === GeneratorRole.ADMIN && (await this.runSeeder(model, persianModuleName));

    // DONE
    return `✨ The "${pascalCaseModel}" crud generated`;
  }

  /**
   *
   * @param model
   * @param role
   */
  createBase(model: string, role: GeneratorRole): void {
    const { kebabCaseModel } = this.createModelCases(model);
    const { lowerCaseRole } = this.createRoleCases(role);

    // find module folder in src folder using ls
    shell.cd(__baseDir + '/src');
    const { stdout: ls } = shell.exec(`ls | grep -x ${kebabCaseModel}`);

    if (!ls) {
      // make module folder
      shell.mkdir(kebabCaseModel);

      // make empty roles folder
      shell.mkdir(`${kebabCaseModel}/roles`);

      // copy base module file
      const baseModuleFileSource = __baseDir + `/src/__base/base.module.ts`;
      shell.cp('-R', baseModuleFileSource, kebabCaseModel);

      // copy common folder
      const commonFolderSource = __baseDir + `/src/__base/common`;
      shell.cp('-R', commonFolderSource, kebabCaseModel);
    }

    // make role folder in roles folder using role name
    shell.cd(`${kebabCaseModel}/roles`);
    const { stdout: roleLs } = shell.exec(`ls | grep -x ${lowerCaseRole}`);
    if (!roleLs) {
      const roleFolderSource = __baseDir + `/src/__base/roles/${lowerCaseRole}`;
      shell.cp('-R', roleFolderSource, lowerCaseRole);
    }
  }

  /**
   *
   * @param destination
   * @param model
   */
  async copyRouteGroup(destination: string, model: string): Promise<void> {
    const { pascalCaseModel, kebabCaseModel } = this.createModelCases(model);

    const common = await fs.readFile(destination + '/common/route-group.constant.ts', { encoding: 'utf-8' });

    const newCommon = common.replace('route_group_name', `${pluralize(kebabCaseModel)}`);

    await fs.writeFile(destination + '/common/route-group.constant.ts', newCommon);

    console.log(`✨ The "${pascalCaseModel}" route name generated`);
  }

  /**
   *
   * @param destination
   * @param model
   */
  async copyModelPropsHelper(destination: string, model: string): Promise<void> {
    const { pascalCaseModel, camelCaseModel } = this.createModelCases(model);

    const file = await fs.readFile(destination + '/common/helpers/model-props-builder.helper.ts', {
      encoding: 'utf-8',
    });

    let newModelProps = file.replace(/Base/g, `${pascalCaseModel}`);
    newModelProps = newModelProps.replace(/base/g, `${camelCaseModel}`);

    await fs.writeFile(destination + '/common/helpers/model-props-builder.helper.ts', newModelProps);

    console.log(`✨ The "${pascalCaseModel}" model props generated`);
  }

  /**
   *
   * @param destination
   * @param model
   * @param role
   */
  async copyController(destination: string, model: string, role: GeneratorRole): Promise<void> {
    const { lowerCaseRole } = this.createRoleCases(role);
    const { pascalCaseModel, camelCaseModel, kebabCaseModel } = this.createModelCases(model);

    const controller = await fs.readFile(
      destination + `/roles/${lowerCaseRole}/${lowerCaseRole}.controller.ts`,
      { encoding: 'utf-8' },
    );

    let newController = controller.replace(/Base/g, `${pascalCaseModel}`);
    newController = newController.replace(/__base/g, `${kebabCaseModel}`);
    newController = newController.replace(/base/g, `${camelCaseModel}`);

    await fs.writeFile(destination + `/roles/${lowerCaseRole}/${lowerCaseRole}.controller.ts`, newController);

    console.log(`✨ The "${pascalCaseModel}" controller generated`);
  }

  /**
   *
   * @param destination
   * @param model
   * @param role
   */
  async copyService(destination: string, model: string, role: GeneratorRole): Promise<void> {
    const { lowerCaseRole } = this.createRoleCases(role);
    const { pascalCaseModel, camelCaseModel, kebabCaseModel } = this.createModelCases(model);

    const service = await fs.readFile(destination + `/roles/${lowerCaseRole}/${lowerCaseRole}.service.ts`, {
      encoding: 'utf-8',
    });

    let newService = service.replace(/Base/g, `${pascalCaseModel}`);
    newService = newService.replace(/__base/g, `${kebabCaseModel}`);
    newService = newService.replace(/base/g, `${camelCaseModel}`);

    await fs.writeFile(destination + `/roles/${lowerCaseRole}/${lowerCaseRole}.service.ts`, newService);

    console.log(`✨ The "${pascalCaseModel}" service generated`);
  }

  /**
   *
   * @param destination
   * @param model
   * @param role
   */
  async copyMainModule(destination: string, model: string, role: GeneratorRole): Promise<void> {
    const { pascalCaseModel, kebabCaseModel } = this.createModelCases(model);

    let mod;
    const modDest = (await this.fileExists(destination + '/base.module.ts'))
      ? destination + '/base.module.ts'
      : (await this.fileExists(destination + `/${kebabCaseModel}.module.ts`))
        ? destination + `/${kebabCaseModel}.module.ts`
        : '';

    if (modDest) {
      mod = await fs.readFile(modDest, {
        encoding: 'utf-8',
      });
    }

    if (mod) {
      let newMod = mod;

      switch (role) {
        case GeneratorRole.ADMIN:
          newMod = mod.replace(/\/\/@admin /g, ``);
          break;

        case GeneratorRole.USER:
          newMod = mod.replace(/\/\/@user /g, ``);
          break;

        default:
          break;
      }

      newMod = newMod.replace(/Base/g, `${pascalCaseModel}`);
      await fs.writeFile(modDest, newMod);
      await fs.rename(modDest, `${kebabCaseModel}.module.ts`);
    }
    console.log(`✨ The "${pascalCaseModel}" main module updated`);
  }

  /**
   *
   * @param destination
   * @param model
   * @param role
   */
  async copyRoleModule(destination: string, model: string, role: GeneratorRole): Promise<void> {
    const { lowerCaseRole } = this.createRoleCases(role);
    const { pascalCaseModel } = this.createModelCases(model);

    const roleMod = await fs.readFile(destination + `/roles/${lowerCaseRole}/${lowerCaseRole}.module.ts`, {
      encoding: 'utf-8',
    });

    const newRoleMod = roleMod.replace(/Base/g, `${pascalCaseModel}`);
    await fs.writeFile(destination + `/roles/${lowerCaseRole}/${lowerCaseRole}.module.ts`, newRoleMod);

    console.log(`✨ The "${pascalCaseModel}" module generated`);
  }

  /**
   *
   * @param model
   */
  async fixAppModule(model: string): Promise<void> {
    const { pascalCaseModel, kebabCaseModel } = this.createModelCases(model);

    const appDest = __baseDir + '/src/app.module.ts';
    const appModule = await fs.readFile(appDest, { encoding: 'utf-8' });

    let newAppModule = '';

    if (appModule.indexOf(`${pascalCaseModel}Module,`) < 0)
      newAppModule = appModule.replace('BaseModule,', `${pascalCaseModel}Module,\n    BaseModule,`);

    if (appModule.indexOf(`import { ${pascalCaseModel}Module }`) < 0)
      newAppModule = newAppModule.replace(
        "import { BaseModule as BaseModule } from './__base/base.module';",
        `import { ${pascalCaseModel}Module } from './${kebabCaseModel}/${kebabCaseModel}.module';\nimport { BaseModule as BaseModule } from './__base/base.module';`,
      );

    if (newAppModule) await fs.writeFile(appDest, newAppModule);

    console.log(`✨ The "${pascalCaseModel}" app module updated`);
  }

  /**
   * Create dto
   * @param model
   * @param role
   * @returns
   */
  async createDto(model: string, role: GeneratorRole): Promise<void> {
    const dto = [];
    const { pascalCaseModel, kebabCaseModel } = this.createModelCases(model);

    const modelFields = Prisma.dmmf.datamodel.models.find((e) => e.name === pascalCaseModel);

    for (const field of modelFields.fields) {
      if (['String', 'Int', 'Float', 'Boolean', 'Json'].includes(field.type) && field.name !== 'id') {
        const type = field.type;
        const name = field.name;

        let defaultValue = this.findDefaultValue(name, type);
        defaultValue = type == 'Int' || type == 'Float' ? +defaultValue : `'${defaultValue}'`;

        const typeDecorator = this.findTypeDecorator(type);
        const valueType = type === 'Int' || type === 'Float' ? 'number' : type.toLowerCase();
        const requiredDecorator = field.isRequired ? '@_IsNotEmpty()' : '@IsOptional()';

        dto.push(`
  @ApiProperty({ required: ${field.isRequired}, default: ${defaultValue} })
  ${typeDecorator}
  ${requiredDecorator}
  ${name}: ${valueType}
        `);
      }
    }

    const dtoText = dto.join('\n').trim();
    const finalText = `import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import {
  _IsInt,
  _IsNotEmpty,
  _IsString,
  _IsNumber,
  _IsBoolean
} from 'src/common/pipes/validator-translate.pipe';
import { Type } from 'class-transformer';

export class Create${pascalCaseModel}${role}Dto {
  ${dtoText}
}`;

    const finalUpdateText = `import { Create${pascalCaseModel}${role}Dto } from './create.dto';

export class Update${pascalCaseModel}${role}Dto extends Create${pascalCaseModel}${role}Dto {}`;

    fs.writeFile(
      __baseDir + `/src/${kebabCaseModel}/roles/${role.toLowerCase()}/dto/create.dto.ts`,
      finalText,
    );
    fs.writeFile(
      __baseDir + `/src/${kebabCaseModel}/roles/${role.toLowerCase()}/dto/update.dto.ts`,
      finalUpdateText,
    );
    const findDto = await fs.readFile(
      __baseDir + `/src/${kebabCaseModel}/roles/${role.toLowerCase()}/dto/find-all.dto.ts`,
      { encoding: 'utf-8' },
    );

    const newDto = findDto.replace(/Base/g, `${pascalCaseModel}`);
    await fs.writeFile(
      __baseDir + `/src/${kebabCaseModel}/roles/${role.toLowerCase()}/dto/find-all.dto.ts`,
      newDto,
    );

    const updatePartialDest =
      __baseDir + `/src/${kebabCaseModel}/roles/${role.toLowerCase()}/dto/update-partial.dto.ts`;
    const isUpdatePartialDestExist = await this.fileExists(updatePartialDest);
    if (isUpdatePartialDestExist) {
      const updatePartialText = await fs.readFile(updatePartialDest, {
        encoding: 'utf-8',
      });
      const newUpdatePartialText = updatePartialText.replace(/Base/g, `${pascalCaseModel}`);
      await fs.writeFile(updatePartialDest, newUpdatePartialText);
    }
    `✨ The "${pascalCaseModel}" ${role} dto generated`;
    return;
  }

  /**
   *
   * @param destination
   * @param model
   * @param role
   */
  async copyAdminFilter(destination: string, model: string): Promise<void> {
    const { pascalCaseModel, camelCaseModel, kebabCaseModel } = this.createModelCases(model);

    const filter = await fs.readFile(destination + `/common/helpers/filter-validator.helper.ts`, {
      encoding: 'utf-8',
    });

    let newFilteer = filter.replace(/Base/g, `${pascalCaseModel}`);
    newFilteer = newFilteer.replace(/__base/g, `${kebabCaseModel}`);
    newFilteer = newFilteer.replace(/base/g, `${camelCaseModel}`);

    await fs.writeFile(destination + `/common/helpers/filter-validator.helper.ts`, newFilteer);

    console.log(`✨ The "${pascalCaseModel}" admin filter generated`);
  }

  /**
   *
   * @param model
   * @param persianName
   * @returns
   */
  async runSeeder(model: string, persianName: string): Promise<void> {
    const { kebabCaseModel } = this.createModelCases(model);

    const seedDest = __baseDir + '/prisma/seed/module.seeder.ts';
    const seed = await fs.readFile(seedDest, { encoding: 'utf-8' });
    if (!seed.includes(pluralize(kebabCaseModel))) {
      const newSeed = seed.replace(
        '];',
        ` { name: '${persianName}', key: '${`${pluralize(kebabCaseModel)}`}'},\n ];`,
      );
      await fs.writeFile(seedDest, newSeed);
      shell.cd(__baseDir);
      shell.exec('yarn seed --seeder=modules');
    }
    return;
  }

  /* -------------------------------------------------------------------------- */
  /*                                   HELPERS                                  */
  /* -------------------------------------------------------------------------- */
  /**
   * checl file exist
   * @param path
   * @returns
   */
  async fileExists(path: string): Promise<boolean> {
    try {
      await fs.stat(path);
      return true;
    } catch (error) {
      return false;
    }
  }

  validateModelName(model: string): boolean {
    return Prisma.dmmf.datamodel.models.findIndex((e) => e.name == model) > -1;
  }

  createModelCases(model: string): {
    pascalCaseModel: string;
    camelCaseModel: string;
    kebabCaseModel: string;
  } {
    const pascalCaseModel = model;
    const camelCaseModel = camelCase(model);
    const kebabCaseModel = kebabCase(model);

    return { pascalCaseModel, camelCaseModel, kebabCaseModel };
  }

  createRoleCases(role: string): {
    pascalCaseRole: string;
    lowerCaseRole: string;
  } {
    const pascalCaseRole = role;
    const lowerCaseRole = role.toLowerCase();

    return { pascalCaseRole, lowerCaseRole };
  }

  findTypeDecorator(type: string): string {
    switch (type) {
      case 'String':
        return '@_IsString()';

      case 'Int':
        return `@_IsInt()
  @Type(() => Number)`;

      case 'Float':
        return `@_IsNumber()
  @Type(() => Number)`;

      case 'Boolean':
        return '@_IsBoolean()';

      default:
        return '';
    }
  }

  findDefaultValue(value: string, type: string): string | number {
    switch (value) {
      case 'mobile_number':
        return '09120000000';

      case 'sheba':
        return '170170000000123450080000';

      default:
        if (type === 'Int') return 1;
        if (type === 'Float') return 40.456;

        return LOREM_IPSUM_TITLE;
    }
  }
}
