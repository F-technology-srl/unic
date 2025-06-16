import { IsEmail } from 'class-validator';

export class InitResetPasswordDto {
  @IsEmail()
  email!: string;
}
