export class RepositoryAssetDto {
  repository_asset_uuid!: string;
  bucket_uri!: string;
  mime_type!: string;
  user_file_name!: string;
  created_at!: Date;
  updated_at!: Date;
  deleted_at?: Date | null;
}
