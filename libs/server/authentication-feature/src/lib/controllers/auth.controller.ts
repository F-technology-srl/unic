import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from '../services';
import { Response } from 'express';
import { UserLoginDto } from '@unic/shared/user-dto';
import { AuthGuard } from '../guards';

@ApiTags('Authentication')
@Controller('/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body() userLoginDto: UserLoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const user = await this.authService.findOneByEmail(userLoginDto.email);

    if (!user) {
      throw new UnauthorizedException('Unauthorized user');
    }

    const role = user.platform_role;
    const access_token = await this.authService.signIn(
      userLoginDto.email,
      userLoginDto.password,
      user.platform_role,
    );

    response
      .cookie(AuthGuard.retriveCookieName(role), access_token, {
        httpOnly: true,
      })
      .send({ status: true });
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) response: Response) {
    response
      .clearCookie(AuthGuard.retriveCookieName('standard'))
      .clearCookie(AuthGuard.retriveCookieName('administrator'))
      .send({ status: true });
  }
}
