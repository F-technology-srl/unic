import { UserDto } from '@unic/shared/user-dto';
import { InjectMailerService, MailerService } from '@unic/server/nest-mailer';
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  InjectServerUserFeatureModuleOptions,
  ServerUserFeatureModuleOptions,
} from '../server-user-options';
import { UserService } from './user.service';
import { JwtService } from '@nestjs/jwt';

const tokenScope = 'urn:reset-password' as const;

interface ResetPasswordEmailInterface {
  name: string;
  accountEmail: string;
  url: string;
  titleEmail: string;
}

export interface ResetPasswordJWTPayload {
  user_uuid: string;
  scope: typeof tokenScope;
}

@Injectable()
export class ResetPasswordService {
  constructor(
    @InjectMailerService('reset-password.ejs')
    private mailerResetPasswordEmail: MailerService<ResetPasswordEmailInterface>,
    @InjectServerUserFeatureModuleOptions()
    private options: ServerUserFeatureModuleOptions,
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  logger = new Logger('ResetPasswordService');

  async sendResetPasswordEmail(user: UserDto) {
    const { bufferToken, basePathLinks } =
      await this.getTokenAndBasePathForResetMail(user);
    if (user) {
      this.mailerResetPasswordEmail
        .sendMail({
          to: user.email,
          from: this.options.mail.emailSender,
          subject: 'Unic - Reset password',
          data: {
            titleEmail: 'Reset password',
            name: user.first_name + ' ' + user.last_name || user.email,
            accountEmail: user.email,
            url: basePathLinks + '/auth/reset/?token=' + bufferToken,
          },
        })
        .catch((error) => {
          this.logger.error('Unable to send reset password email', error);
        });
    } else {
      Logger.log('User not found');
      throw new BadRequestException('User not found');
    }
    return true;
  }

  async generateToken(user: UserDto) {
    const payload: ResetPasswordJWTPayload = {
      user_uuid: user.user_uuid,
      scope: tokenScope,
    };

    return await this.jwtService.signAsync(payload, { expiresIn: '1h' });
  }

  async updatePasswordUsing(token: string, newPassword: string) {
    const user = await this.validateTokenAndGetUser(
      Buffer.from(token, 'base64').toString('utf-8'),
    );
    await this.userService.updatePassword(user, newPassword);
    return user;
  }

  async validateTokenAndGetUser(token: string) {
    console.log('before decoded');
    const decoded =
      this.jwtService.verify<Partial<ResetPasswordJWTPayload>>(token);
    console.log('decode: ', decoded);
    if (decoded?.scope !== tokenScope) {
      throw new BadRequestException('Invalid token scope');
    }
    if (!decoded?.user_uuid) {
      throw new BadRequestException('Token is malformed missing user_uuid');
    }
    const user = await this.userService.findOneByUUID(decoded.user_uuid);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async getTokenAndBasePathForResetMail(user: UserDto) {
    const token = await this.generateToken(user);
    const basePathLinks = this.options.mail.basePathLinks;
    const bufferToken = Buffer.from(token).toString('base64');
    return { bufferToken, basePathLinks };
  }
}
