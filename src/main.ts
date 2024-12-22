import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { useContainer } from 'class-validator';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filter/http-exception.filter';
import validationOptions from './common/utils/validation-options';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { StoplightElementsModule } from 'nestjs-stoplight-elements';
import { StoplightElementsOptions } from 'nestjs-stoplight-elements/build/src/interfaces/elements-options.interface';
import { RBACInterceptor } from './common/interceptors/rbac.interceptor';
import { __baseDir } from './config/settings';
import { NestExpressApplication } from '@nestjs/platform-express';
import { LoggerService } from './logger/logger.service';
import * as requestIp from 'request-ip';
import { P2EInterceptor } from './common/interceptors/p2e.interceptor';

declare global {
  interface BigInt {
    toJSON(): string;
  }
}
BigInt.prototype.toJSON = function (): string {
  return this.toString();
};
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: new LoggerService().getLogger(),
  });
  const configService = app.get(ConfigService);

  app.setGlobalPrefix(configService.get('app.apiPrefix'), {
    exclude: ['/'],
  });

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.useGlobalPipes(new ValidationPipe(validationOptions));
  app.useGlobalFilters(new HttpExceptionFilter(configService));
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  });

  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalInterceptors(new RBACInterceptor());
  app.useGlobalInterceptors(new P2EInterceptor());

  app.setBaseViewsDir(__baseDir + '/views');
  app.setViewEngine('ejs');

  if (process.env.NODE_ENV === 'development') {
    const config = new DocumentBuilder()
      .setTitle('Kian Marketplace')
      .setDescription('The API and DTO - RESTfull')
      // .addServer(process.env.BASE_URL, 'Base Url')
      .setVersion('1.2')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'user-jwt',
      )
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'user-auth-jwt',
      )
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'admin-jwt',
      )
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'admin-auth-jwt',
      )
      .setExternalDoc('Json export', '/api-json')
      .build();

    const document = SwaggerModule.createDocument(app, config, {});
    // SwaggerModule.setup('api', app, document,{swaggerOptions:{}});

    // Instead of using SwaggerModule.setup() you call this module
    const options: StoplightElementsOptions = {
      layout: 'sidebar',
      router: 'memory',
    };

    const StoplightElements = new StoplightElementsModule(app, document, options);

    await StoplightElements.start('/docs');
  }

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  app.use(requestIp.mw());

  await app.listen(process.env.PORT || 3000, '0.0.0.0');
}

bootstrap();
// AppClusterService.clusterize(bootstrap);
