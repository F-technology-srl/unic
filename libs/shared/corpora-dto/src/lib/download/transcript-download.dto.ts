import { IsString, IsUUID, IsOptional, IsNumber } from 'class-validator';

export class TranscriptToDownload {
  @IsString()
  text_id!: string;

  @IsUUID()
  corpora_uuid!: string;

  @IsOptional()
  @IsString()
  word_found?: string | null;

  @IsOptional()
  @IsNumber()
  offset?: number | null;

  @IsOptional()
  @IsNumber()
  offset_length?: number | null;

  @IsOptional()
  @IsString()
  alignment_slug?: string | null;
}
