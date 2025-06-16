import {
  CanActivate,
  ExecutionContext,
  createParamDecorator,
  Injectable,
  SetMetadata,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { AuthService } from '../services';
import { PlatformUserRoleEnumType } from '@unic/database';

export const AuthRole = (
  roleName: PlatformUserRoleEnumType | Array<PlatformUserRoleEnumType>,
) => SetMetadata('role', Array.isArray(roleName) ? roleName : [roleName]);

export type AuthenticatedUser = NonNullable<
  Awaited<ReturnType<typeof AuthService.prototype.findOneByUUID>>
>;

export const RequestLogin = (requestLogin?: boolean) =>
  SetMetadata('request_login', requestLogin);

export const AuthUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
    private authService: AuthService,
  ) {}

  static retriveCookieName(role: 'standard' | 'administrator') {
    return 'x-auth-unic-' + role;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRole = this.reflector.get<
      Array<'standard' | 'administrator'>
    >('role', context.getHandler()) ?? ['administrator', 'standard'];

    const requiredLogin =
      this.reflector.get<boolean>('request_login', context.getHandler()) ??
      true;

    const req = context.switchToHttp().getRequest();
    // Get all the cookies names for the provided roles
    const cookieNames = requiredRole.map(AuthGuard.retriveCookieName);
    // Get all the tokens from the cookies using the names
    const tokens = cookieNames
      .map((cName) => req.cookies[cName])
      // Filter out the not found cookie names
      .filter(Boolean);

    if (tokens.length === 0) {
      return this.throwErrorIfNecessary(requiredLogin);
    }

    try {
      // If we have multiple tokens, we just use the first one
      const token = tokens[0];
      const decoded = await this.jwtService.verify(token);
      const user = await this.authService.findOneByUUID(decoded.user_uuid);

      if (user) {
        if (!requiredRole.find((role) => role === user.platform_role)) {
          this.throwErrorIfNecessary(requiredLogin);
        }
        // Attach the user to the request object
        // so we can retrive it in the controller parameter decorator
        req.user = user;
        return true;
      }

      return this.throwErrorIfNecessary(requiredLogin);
    } catch (err) {
      console.error('err>>>>', err);
      return this.throwErrorIfNecessary(requiredLogin);
    }
  }

  throwErrorIfNecessary(requiredLogin: boolean): boolean {
    if (requiredLogin) {
      throw new UnauthorizedException('Unauthorized');
    } else {
      return true;
    }
  }
}
