import { UserStatusEnum } from '@unic/shared/database-dto';

export class UserDto {
  user_uuid!: string;
  first_name!: string;
  last_name!: string;
  profession?: string | null;
  institution?: string | null;
  explanation!: string;
  email!: string;
  platform_role!: 'standard' | 'administrator';
  status!: UserStatusEnum;
  created_at!: Date;
  updated_at!: Date;
  deleted_at?: Date | null;
  status_updated_at?: Date | null;
  verified_at?: Date | null;
  status_updated_by?: string | null;
}
