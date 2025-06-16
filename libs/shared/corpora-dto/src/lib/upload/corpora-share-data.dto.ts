import { IsOptional, IsUUID } from 'class-validator';
import { UserConventionType } from '../corpora';
import { Type } from 'class-transformer';

export class ZipAssets {
  @IsUUID()
  @IsOptional()
  transcriptsZipAssetUuid?: string;

  @IsUUID()
  @IsOptional()
  alignmentsZipAssetUuid?: string;

  @IsUUID()
  @IsOptional()
  annotationsZipAssetUuid?: string;

  @IsUUID()
  @IsOptional()
  videosZipAssetUuid?: string;

  @IsUUID()
  @IsOptional()
  audiosZipAssetUuid?: string;

  @IsUUID()
  @IsOptional()
  documentsZipAssetUuid?: string;
}

export class CorporaShareDataDto {
  @IsUUID()
  corpora_uuid!: string;

  @IsOptional()
  @Type(() => ZipAssets)
  zipAssets?: ZipAssets | null;

  @IsOptional()
  userConventionRule?: UserConventionType;
}

export interface CorporaShareDataResponseDto {
  status: boolean;
}
