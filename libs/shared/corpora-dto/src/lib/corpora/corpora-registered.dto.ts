export interface CorporaRegisteredDto {
  acronym: string | null;
  corpora_uuid: string | null;
  number_of_visit: number | null;
  number_of_downloads: number | null;
  status_label?: string | null;
  upload_data_at?: Date | null;
}
