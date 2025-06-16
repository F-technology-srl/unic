import { createTransport, Transporter } from 'nodemailer';
import { Logger } from '@nestjs/common';

export enum TransportType {
  'smtp',
  'ethereal',
}

export interface TransportSmtpConfigInterface {
  type: TransportType.smtp;
  options: {
    pool?: boolean;
    port?: number;
    secure?: boolean;
    host: string;
    auth: {
      type?: 'login' | 'oauth2';
      user: string;
      pass: string;
    };
    tls?: {
      rejectUnauthorized?: boolean;
    };
  };
}

export interface TransportEtherealMailConfigInterface {
  type: TransportType.ethereal;
  options: {
    username: string;
    password: string;
  };
}

export type JoinTransportConfig =
  | TransportSmtpConfigInterface
  | TransportEtherealMailConfigInterface;

export type TransportConfigInterface = JoinTransportConfig;

const logger = (() => {
  const nestLogger = new Logger('NestMailer');
  const fromParamsToString = (params: any[]) => {
    let teplate = (params?.[1] as string) || '';
    const occurences = teplate.match(/%s/g)?.length || 0;
    const offset = 2;
    for (let index = 0; index < occurences; index++) {
      const str = params[offset + index];
      teplate = teplate.replace('%s', str);
    }
    return teplate;
  };
  return {
    level: (level: any) => null,
    trace: (...params: any[]) => nestLogger.verbose(fromParamsToString(params)),
    debug: (...params: any[]) => nestLogger.debug(fromParamsToString(params)),
    info: (...params: any[]) => nestLogger.verbose(fromParamsToString(params)),
    warn: (...params: any[]) => nestLogger.warn(fromParamsToString(params)),
    error: (...params: any[]) => nestLogger.error(fromParamsToString(params)),
    fatal: (...params: any[]) => nestLogger.error(fromParamsToString(params)),
  };
})();

export const makeTransport = async (
  config: TransportConfigInterface,
): Promise<Transporter> => {
  // Transport for testing
  if (config.type === TransportType.ethereal) {
    logger.info(null, 'Use ethereal mail as a provider');
    return createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      logger,
      auth: {
        user: config.options.username,
        pass: config.options.password,
      },
    });
  }

  // Smtp transport
  if (config.type === TransportType.smtp) {
    logger.info(null, 'Use smtp as a provider');
    return createTransport({
      ...config.options,
      logger,
    });
  }

  throw new Error(
    `Type of transport is not supported, unable to create a transport`,
  );
};
