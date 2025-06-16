import { IsEmail, IsOptional, Matches, MaxLength } from 'class-validator';
import { Match } from './decorators';
import { passwordRegex } from './create-user.dto';

export class RegisterUserDto {
  @IsEmail()
  email!: string;

  @MaxLength(40, {
    message: 'The password must be shorter than 40 characters',
  })
  @Matches(passwordRegex, {
    message:
      'The password must be at least 8 characters long, contain at least one number, one symbol (@, $, !, %, *, #, ?, &, .), and one uppercase letter.',
  })
  password!: string;

  @Match('password', { message: 'The passwords do not match' })
  repeat_password!: string;

  @IsOptional()
  company_uuid?: string;
}
