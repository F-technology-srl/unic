import { TransportConfigInterface } from '../utils';

export interface NestMailerModuleConfigInterface {
  basePathTemplates: string;
  transport: TransportConfigInterface;
  production: boolean;
}
