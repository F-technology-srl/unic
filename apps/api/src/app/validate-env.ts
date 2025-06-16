import { plainToInstance } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsString,
  ValidateIf,
  validateSync,
} from 'class-validator';
import expand from 'dotenv-expand';

export enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
  Stage = 'stage',
}

export class EnvironmentVariables {
  @IsEnum(Environment)
  ENVIRONMENT: Environment;

  @IsString()
  CLIENT_APP_BASE_URL: string;

  @IsString()
  ADMIN_EMAIL: string;

  @IsNumber()
  PORT: number;

  @IsString()
  DB_CONNECTION_STRING: string;

  @IsString()
  JWT_SECRET: string;

  @IsString()
  JWT_EXPIRES_IN: string;

  @IsString()
  PATH_TEMP: string;

  @IsString()
  PATH_DISK: string;

  @ValidateIf(
    (o) =>
      o.ENVIRONMENT === Environment.Production ||
      o.ENVIRONMENT === Environment.Stage,
  )
  @IsString()
  SMTP_HOST: string;

  @ValidateIf(
    (o) =>
      o.ENVIRONMENT === Environment.Production ||
      o.ENVIRONMENT === Environment.Stage,
  )
  @IsNumber()
  SMTP_PORT: number;

  @ValidateIf(
    (o) =>
      o.ENVIRONMENT === Environment.Production ||
      o.ENVIRONMENT === Environment.Stage,
  )
  @IsString()
  SMTP_USER: string;

  @ValidateIf(
    (o) =>
      o.ENVIRONMENT === Environment.Production ||
      o.ENVIRONMENT === Environment.Stage,
  )
  @IsString()
  SMTP_PASS: string;

  @ValidateIf(
    (o) =>
      o.ENVIRONMENT === Environment.Production ||
      o.ENVIRONMENT === Environment.Stage,
  )
  @IsBoolean()
  SMTP_SECURE: boolean;

  @ValidateIf(
    (o) =>
      o.ENVIRONMENT === Environment.Production ||
      o.ENVIRONMENT === Environment.Stage,
  )
  @IsBoolean()
  SMTP_REJECT_UNAUTH: boolean;

  @IsString()
  SMTP_EMAIL_SENDER: string;

  @ValidateIf(
    (o) =>
      o.ENVIRONMENT === Environment.Development ||
      o.ENVIRONMENT === Environment.Test,
  )
  @IsString()
  ETHEREAL_USERNAME: string;

  @ValidateIf(
    (o) =>
      o.ENVIRONMENT === Environment.Development ||
      o.ENVIRONMENT === Environment.Test,
  )
  @IsString()
  ETHEREAL_PASSWORD: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return expand.expand({
    parsed: validatedConfig as unknown as Record<string, string>,
  });
}

export function getClientAppBaseUrl() {
  return process.env['CLIENT_APP_BASE_URL'] || 'http://localhost:4300';
}
export function getPathTemp() {
  return process.env['PATH_TEMP'] || '';
}
export function getPathDisk() {
  return process.env['PATH_DISK'] || '';
}
