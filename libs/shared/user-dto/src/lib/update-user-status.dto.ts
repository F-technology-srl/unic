import { IsEnum, IsUUID } from 'class-validator';
import { UserStatusEnum } from '@unic/shared/database-dto';

export class UpdateUserStatusDto {
  @IsUUID()
  user_uuid!: string;

  @IsEnum(UserStatusEnum)
  status!: UserStatusEnum;
}
