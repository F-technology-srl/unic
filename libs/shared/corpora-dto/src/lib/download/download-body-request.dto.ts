import { Type } from 'class-transformer';
import { TranscriptToDownload } from './transcript-download.dto';
import { DownloadDataTypeEnum } from '@unic/shared/database-dto';
import { IsArray, ValidateNested, IsEnum } from 'class-validator';

export class DownloadBodyRequestDto {
  @Type(() => TranscriptToDownload)
  @IsArray()
  @ValidateNested({ each: true })
  transcripts!: TranscriptToDownload[];

  @IsArray()
  @IsEnum(DownloadDataTypeEnum, { each: true })
  with_data!: DownloadDataTypeEnum[];
}
