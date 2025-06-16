import { Inject, Injectable } from '@nestjs/common';
import { renderFile } from 'ejs';
import { CONFIGURATION_TOKEN } from '../tokens';
import { NestMailerModuleConfigInterface } from '../types';
import { join } from 'path';

@Injectable()
export class TemplateEngine {
  constructor(
    @Inject(CONFIGURATION_TOKEN)
    private config: NestMailerModuleConfigInterface,
  ) {}

  async render<DataShape>(
    templatename: string,
    data?: DataShape,
  ): Promise<string> {
    return new Promise((res, rej) => {
      const pathFile = join(this.config.basePathTemplates, templatename);
      renderFile(
        pathFile,
        data as any,
        { root: this.config.basePathTemplates },
        (error, result) => {
          if (error) {
            return rej(error);
          }
          return res(result);
        },
      );
    });
  }
}
