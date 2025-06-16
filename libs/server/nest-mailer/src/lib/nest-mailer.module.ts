import {
  DynamicModule,
  FactoryProvider,
  Module,
  Provider,
} from '@nestjs/common';
import { DebugController } from './controllers';
import { TemplateNotFoundError } from './errors';
import { TransporterService, TemplateEngine, MailerService } from './services';
import { CONFIGURATION_TOKEN, NODE_MAILER_TRANSPORT } from './tokens';
import { NestMailerModuleConfigInterface } from './types';
import {
  checkIfTemplateExists,
  getTemplateToken,
  makeTransport,
} from './utils';

class RootNestMailerModule {
  static forRoot(config: NestMailerModuleConfigInterface): DynamicModule {
    const configProvider: Provider = {
      provide: CONFIGURATION_TOKEN,
      useValue: config,
    };

    const transporterProvider: Provider = {
      provide: NODE_MAILER_TRANSPORT,
      useFactory: () => makeTransport(config.transport),
    };

    const controllers = [];

    if (!config.production) {
      controllers.push(DebugController);
    }

    return {
      module: RootNestMailerModule,
      global: true,
      providers: [configProvider, transporterProvider, TemplateEngine],
      controllers,
      exports: [configProvider, transporterProvider, TemplateEngine],
    };
  }

  static forRootAsync(options: {
    useFactory: (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...args: any[]
    ) =>
      | Promise<NestMailerModuleConfigInterface>
      | NestMailerModuleConfigInterface;
    inject?: FactoryProvider['inject'];
  }): DynamicModule {
    const configProvider: Provider = {
      provide: CONFIGURATION_TOKEN,
      useFactory: options.useFactory,
      inject: options.inject,
    };

    const transporterProvider: Provider = {
      provide: NODE_MAILER_TRANSPORT,
      useFactory: (config: NestMailerModuleConfigInterface) =>
        makeTransport(config.transport),
      inject: [CONFIGURATION_TOKEN],
    };

    return {
      module: RootNestMailerModule,
      global: true,
      providers: [configProvider, transporterProvider, TemplateEngine],
      controllers: [DebugController],
      exports: [configProvider, transporterProvider, TemplateEngine],
    };
  }
}

@Module({})
export class NestMailerModule {
  static forRoot(config: NestMailerModuleConfigInterface): DynamicModule {
    return RootNestMailerModule.forRoot(config);
  }

  static forRootAsync(
    options: Parameters<typeof RootNestMailerModule.forRootAsync>[0],
  ): DynamicModule {
    return RootNestMailerModule.forRootAsync(options);
  }

  static forFeature(templates: Array<string> = []): DynamicModule {
    const mailerProviders: Array<Provider> = templates.map((templateName) => ({
      provide: getTemplateToken(templateName),
      useFactory: async (
        transp: TransporterService,
        tempEngine: TemplateEngine,
        config: NestMailerModuleConfigInterface,
      ) => {
        if (
          !(await checkIfTemplateExists(templateName, config.basePathTemplates))
        ) {
          throw new TemplateNotFoundError(
            templateName,
            config.basePathTemplates,
          );
        }
        return new MailerService(transp, tempEngine, templateName);
      },
      inject: [TransporterService, TemplateEngine, CONFIGURATION_TOKEN],
    }));

    return {
      module: NestMailerModule,
      providers: [TransporterService, ...mailerProviders],
      exports: [...mailerProviders],
    };
  }
}
