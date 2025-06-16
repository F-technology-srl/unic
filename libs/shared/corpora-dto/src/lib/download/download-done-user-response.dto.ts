import { DownloadDataTypeEnum } from '@unic/shared/database-dto';

export class DownloadsDoneResponse {
  download_uuid!: string;
  created_at!: Date;
  with_data?: DownloadDataTypeEnum[] | null;
  download_items?: DownloadsItem[];
}
export class DownloadsItem {
  text_id!: string;
  corpora_uuid!: string;
  word_found?: string | null;
  offset?: number | null;
  offset_length?: number | null;
  alignment_slug?: string | null;
  corpora?: { acronym: string };
  transcript?: { slug: string };
}
