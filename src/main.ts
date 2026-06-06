import { RapidocModule } from '@b8n/nestjs-rapidoc';
import { RequestMethod, ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { useContainer } from 'class-validator';
import * as requestIp from 'request-ip';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filter/http-exception.filter';
import { P2EInterceptor } from './common/interceptors/p2e.interceptor';
import { RBACInterceptor } from './common/interceptors/rbac.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import validationOptions from './common/utils/validation-options';
import { __baseDir } from './config/settings';
import { LoggerService } from './logger/logger.service';

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
    exclude: [{ path: 'robots.txt', method: RequestMethod.GET }],
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

  app.set('trust proxy', true);
  app.use(requestIp.mw());

  app.setBaseViewsDir(__baseDir + '/views');
  app.setViewEngine('ejs');

  if (process.env.NODE_ENV === 'development') {
    const config = new DocumentBuilder()
      .setTitle('Jayab V2')
      .setDescription('The API and DTO - RESTfull')
      .addServer('http://localhost:3001', 'Local')
      .addServer('https://api.jayab.app', 'Remote Production')
      .setVersion('1.2')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'Authorization',
          description: 'Enter User JWT token',
          in: 'header',
        },
        'user-jwt',
      )
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'Authorization',
          description: 'Enter User Auth JWT token',
          in: 'header',
        },
        'user-auth-jwt',
      )
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'Authorization',
          description: 'Enter Admin JWT token',
          in: 'header',
        },
        'admin-jwt',
      )
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'Authorization',
          description: 'Enter Admin Auth JWT token',
          in: 'header',
        },
        'admin-auth-jwt',
      )
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'Authorization',
          description: 'Enter Mian JWT token',
          in: 'header',
        },
        'mian-jwt',
      )
      .setExternalDoc('Json export', '/api-json')
      .build();

    const document = SwaggerModule.createDocument(app, config, {});
    // SwaggerModule.setup('api', app, document,{swaggerOptions:{}});

    RapidocModule.setup('docs', app, document, {
      customLogo: process.env.APP_LOGO,
      customSiteTitle: 'Jayab Docs',
      rapidocOptions: {
        defaultSchemaTab: 'schema',
        allowTry: true,
        allowAuthentication: true,
        allowServerSelection: true,
        layout: 'row',
        navBgColor: '#0f172b',
        bgColor: '#1d293d',
        headerColor: '#0f172b',
        primaryColor: '#00bc7d',
        // textColor: '#171717',
        navTextColor: '#cad5e2',
        persistAuth: true,
        showInfo: true,
        usePathInNavBar: false,
        showMethodInNavBar: 'as-colored-text',
        navItemSpacing: 'relaxed',
        infoDescriptionHeadingsInNavbar: false,
        headingText: 'Jayab',
        renderStyle: 'focused',
        // showCurlBeforeTry: true,
        sortEndpointsBy: 'method',
        fillRequestFieldsWithExample: true,
      },
    });
  }

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  await app.listen(process.env.PORT || 3000, '0.0.0.0');
}

bootstrap();
// AppClusterService.clusterize(bootstrap);
