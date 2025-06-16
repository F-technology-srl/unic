import { join } from 'path';

export class TemplateNotFoundError extends Error {
  constructor(templateName: string, basePath: string) {
    super(`Template not found in ${join(basePath, templateName)}`);
  }
}
