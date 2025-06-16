import { CorporaMetadataStatusEnum } from '@unic/shared/database-dto';
import { IsEnum, IsString } from 'class-validator';

export class UpdateMetadataStatusDto {
  @IsString()
  acronym!: string;

  @IsEnum(CorporaMetadataStatusEnum)
  status!: CorporaMetadataStatusEnum;

  @IsString({ message: 'Fornire un token valido' })
  token!: string;
}
