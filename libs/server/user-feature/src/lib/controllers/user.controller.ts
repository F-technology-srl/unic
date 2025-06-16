import { ApiTags } from '@nestjs/swagger';
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Logger,
  NotFoundException,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { UserService } from '../services';
import {
  CreateUserDto,
  UpdateUserStatusDto,
  UserDto,
  InitResetPasswordDto,
  ResetPasswordDto,
  ApprovalEnum,
} from '@unic/shared/user-dto';
import { InjectMailerService, MailerService } from '@unic/server/nest-mailer';
import { JwtService } from '@nestjs/jwt';
import {
  InjectServerUserFeatureModuleOptions,
  ServerUserFeatureModuleOptions,
} from '../server-user-options';
import {
  AuthenticatedUser,
  AuthGuard,
  AuthRole,
  AuthUser,
} from '@unic/server/authentication-feature';
import { UserStatusEnum } from '@unic/shared/database-dto';
import { ResetPasswordService } from '../services/reset-password.service';

interface AdminNewUserEmailInterface {
  name: string;
  first_name: string;
  last_name: string;
  profession: string;
  institution: string;
  explanation: string;
  button_url: string;
  email: string;
}

interface UserStatusUpdateInterface {
  status: UserStatusEnum;
  url: string;
  titleEmail: string;
}

@ApiTags('Users')
@Controller('/users')
export class UserController {
  constructor(
    private userService: UserService,
    @InjectMailerService('admin-new-user-registration-email.ejs')
    private mailerAdminNewUserEmail: MailerService<AdminNewUserEmailInterface>,
    @InjectMailerService('user-status-update-email.ejs')
    private mailerUserStatusUpdateEmail: MailerService<UserStatusUpdateInterface>,
    private jwtService: JwtService,
    @InjectServerUserFeatureModuleOptions()
    private options: ServerUserFeatureModuleOptions,
    private resetPasswordService: ResetPasswordService,
  ) {}

  logger = new Logger('UserController');

  @Get('/me')
  @UseGuards(AuthGuard)
  async getAuthUser(@AuthUser() user: AuthenticatedUser): Promise<UserDto> {
    return user;
  }

  // @Get()
  // async getUsers() {
  //   return this.userService.getUsers();
  // }

  // @Get(':user_uuid')
  // async getUser(@Param('user_uuid') user_uuid: string): Promise<UserDto> {
  //   return await this.userService.getUserByUUID(user_uuid);
  // }

  @Post()
  async createUser(@Body() createUserDto: CreateUserDto): Promise<UserDto> {
    const found = await this.userService.getUserByEmail(createUserDto.email);

    if (found) {
      throw new BadRequestException('Email already registered');
    }
    const sanitizedEmail = await this.userService.validateUsername(
      createUserDto.email,
    );
    const user = await this.userService.createUser({
      createUserDto: {
        ...createUserDto,
        email: sanitizedEmail,
      },
      userRole: 'standard',
    });

    try {
      const userUpdated = await this.userService.getUserByUUID(user.user_uuid);

      if (!userUpdated) {
        throw new NotFoundException('User not found');
      }

      const token = await this.createTokenJwt(userUpdated.user_uuid);
      const basePathLinks = this.options.mail.basePathLinks;
      await this.mailerAdminNewUserEmail
        .sendMail({
          // multiple emails
          to: this.options.mail.adminEmail.split(','),
          from: this.options.mail.emailSender,
          subject: 'A new registration request has arrived',
          data: {
            name: `${userUpdated.first_name} ${userUpdated.last_name}`,
            first_name: userUpdated.first_name,
            last_name: userUpdated.last_name,
            profession: userUpdated.profession || 'Not provided',
            institution: userUpdated.institution || 'Not provided',
            explanation: userUpdated.explanation,
            button_url: `${basePathLinks}/admin/user-approval?token=${token}`,
            email: userUpdated.email,
          },
        })
        .catch((error) => {
          this.logger.error(
            `Unable to send Registration email for user ${user.email}`,
            error,
          );
        });
    } catch (error) {
      this.logger.error('Error sending verify email or ', error);
    }
    user.password = null;
    user.salt = null;
    return { ...user };
  }

  async createTokenJwt(user_uuid: string) {
    const payload = { user_uuid: user_uuid };
    const token = await this.jwtService.signAsync(payload, {
      secret: this.options.jwt.secret,
    });
    return token;
  }

  @UseGuards(AuthGuard)
  @AuthRole('administrator')
  @Get('/info/:token')
  async getUserInfoFromToken(@Param('token') token: string): Promise<UserDto> {
    const sanitizeToken = token.trim();
    const payload = await this.jwtService.verify(sanitizeToken);
    const user = await this.userService.getUserByUUID(payload.user_uuid);
    return user;
  }

  @Get('/verify/:action/token/:token')
  async verifyUser(
    @Param('token') token: string,
    @Param('action') action: ApprovalEnum,
  ): Promise<{ url: string }> {
    if (action != ApprovalEnum.accept && action != ApprovalEnum.reject) {
      throw new BadRequestException('Invalid action');
    }

    const sanitizeToken = token.trim();
    const payload = await this.jwtService.verify(sanitizeToken);
    const user = await this.userService.getUserByUUID(payload.user_uuid);

    const basePathLinks = this.options.mail.basePathLinks;

    if (!user) {
      this.logger.log('User not found', payload.user_uuid);
      return { url: `${basePathLinks}/404` };
    }

    if (user.status !== UserStatusEnum.PENDING) {
      this.logger.log('User already verified', user.user_uuid);
      return { url: `${basePathLinks}/admin/user-already-verified` };
    }

    try {
      if (action === 'accept') {
        await this.userService.updateUserStatus({
          user_uuid: user.user_uuid,
          status: UserStatusEnum.ACCEPTED,
        });
      } else if (action === 'reject') {
        // await this.userService.updateUserStatus({
        //   user_uuid: user.user_uuid,
        //   status: UserStatusEnum.REJECTED,
        // });
        await this.userService.userDelete(user.user_uuid);
      }

      const titleEmail =
        action === 'accept'
          ? 'Your registration request has been accepted'
          : 'Your registration request has been refused';
      await this.mailerUserStatusUpdateEmail
        .sendMail({
          to: user.email,
          from: this.options.mail.emailSender,
          subject: titleEmail,
          data: {
            status:
              action === 'accept'
                ? UserStatusEnum.ACCEPTED
                : UserStatusEnum.REJECTED,
            url: action === 'accept' ? `${basePathLinks}` : '',
            titleEmail,
          },
        })
        .catch((error) => {
          this.logger.error(
            `Unable to send Registration email for user ${user.email}`,
            error,
          );
        });
    } catch (error) {
      this.logger.error('Error sending verify email or ', error);
    }

    const urlRet =
      action === 'accept'
        ? `${basePathLinks}/admin/user-accepted`
        : `${basePathLinks}/admin/user-rejected`;
    return { url: urlRet };
  }

  @Put('/update-status')
  async updateUserStatus(
    @Body() updateUserStatus: UpdateUserStatusDto,
  ): Promise<UserDto> {
    // check if user uuid is valid
    const user = await this.userService.getUserByUUID(
      updateUserStatus.user_uuid,
    );

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.userService.updateUser(user, updateUserStatus);
  }

  @Get('/verify-email/:token')
  async verifyEmail(@Param('token') token: string): Promise<boolean> {
    const decoded = await this.jwtService.verify(token);
    const user = await this.userService.getUserByUUID(decoded.user_uuid);
    if (user) {
      await this.userService.verifyUserEmail(decoded.user_uuid);
      return true;
    }
    throw new BadRequestException('User not found');
  }

  @Post('/init-reset-password')
  async startResetPassword(
    @Body() initResetPassword: InitResetPasswordDto,
  ): Promise<{ success: boolean }> {
    const user = await this.userService.getUserByEmail(initResetPassword.email);

    if (!user) {
      throw new BadRequestException('User not found');
    }

    await this.sendResetPasswordEmail(user);

    return {
      success: true,
    };
  }

  private async sendResetPasswordEmail(user: UserDto) {
    try {
      this.resetPasswordService.sendResetPasswordEmail(user);
    } catch (error) {
      Logger.verbose(`
        Error, unable to send reset password email to user ${user.email}
      `);
    }
  }

  @Post('/reset-password')
  async resetPassword(@Body() resetPassword: ResetPasswordDto) {
    try {
      const user = await this.resetPasswordService.updatePasswordUsing(
        resetPassword.token,
        resetPassword.password,
      );
      await this.userService.verifyUserEmail(user.user_uuid);
    } catch (error) {
      throw new BadRequestException(error);
    }

    return {
      success: true,
    };
  }
}
