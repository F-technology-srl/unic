import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Match } from './decorators';
import { UserStatusEnum } from '@unic/shared/database-dto';

export const passwordRegex =
  // eslint-disable-next-line no-useless-escape
  /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&_\-\.])[A-Za-z\d@$!%*#?&_\-\.]{8,}$/;

@ValidatorConstraint({ name: 'IsTrue', async: false })
class IsTrueConstraint implements ValidatorConstraintInterface {
  validate(value: boolean, args: ValidationArguments) {
    return value === true;
  }

  defaultMessage(args: ValidationArguments) {
    return 'The checkbox must be checked.';
  }
}

export class CreateUserDto {
  @IsString()
  first_name!: string;

  @IsString()
  last_name!: string;

  @IsOptional()
  @IsString()
  profession?: string | null;

  @IsOptional()
  @IsString()
  institution?: string | null;

  @IsString()
  explanation!: string;

  @IsEmail()
  email!: string;

  @MaxLength(40, {
    message: 'Password must be shorter than 40 characters',
  })
  @Matches(passwordRegex, {
    message:
      'The password must be at least 8 characters long, must contain at least one number, one symbol (@, $, !, %, *, #, ?, &, .) and one uppercase letter',
  })
  password!: string;

  @Match('password', { message: 'Password must be the same' })
  repeat_password!: string;

  // the user is created with a PENDING status
  @IsEnum(UserStatusEnum)
  status: UserStatusEnum = UserStatusEnum.PENDING;

  @IsString()
  // default role is standard
  platform_role: 'standard' | 'administrator' = 'standard';

  @Validate(IsTrueConstraint)
  conditions!: boolean;
}
