import { Inject } from '@nestjs/common';
import { getTemplateToken } from '../utils';

export const InjectMailerService = (templateName: string) =>
  Inject(getTemplateToken(templateName)) as (
    target: object,
    key?: string | symbol,
    index?: number,
  ) => void;
