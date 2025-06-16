import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  DrizzleUnic,
  InjectDrizzle,
  usersCorporaLogsTable,
  usersTable,
} from '@unic/database';
import { CryptService } from './crypt.service';
import { and, eq, ilike, isNull } from 'drizzle-orm';
import { UserStatusEnum } from '@unic/shared/database-dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectDrizzle() private db: DrizzleUnic,
    private jwtService: JwtService,
    private cryptService: CryptService,
  ) {}

  async findOneByEmail(email: string) {
    return (
      await this.db
        .select()
        .from(usersTable)
        .where(
          and(ilike(usersTable.email, email), isNull(usersTable.deleted_at)),
        )
    )[0];
  }

  async findOneByUUID(uuid: string) {
    return (
      await this.db
        .select({
          user_uuid: usersTable.user_uuid,
          email: usersTable.email,
          platform_role: usersTable.platform_role,
          first_name: usersTable.first_name,
          last_name: usersTable.last_name,
          verified_at: usersTable.verified_at,
          explanation: usersTable.explanation,
          institution: usersTable.institution,
          profession: usersTable.profession,
          status: usersTable.status,
          created_at: usersTable.created_at,
          updated_at: usersTable.updated_at,
          deleted_at: usersTable.deleted_at,
        })
        .from(usersTable)
        .where(
          and(eq(usersTable.user_uuid, uuid), isNull(usersTable.deleted_at)),
        )
    )[0];
  }

  async signIn(
    email: string,
    password: string,
    type: 'standard' | 'administrator',
  ): Promise<string> {
    //here check if user is deleted
    const user = await this.findOneByEmail(email);
    const errorFailLogin = new BadRequestException(
      'Login failed. Verify username and password.',
    );
    if (!user) {
      throw errorFailLogin;
    }

    if (user?.password && user.salt && type === user.platform_role) {
      if (
        !this.cryptService.verifyPassword({
          password: password,
          hash: user?.password,
          salt: user.salt,
        })
      ) {
        throw errorFailLogin;
      }
    } else {
      throw errorFailLogin;
    }

    if (user.platform_role !== 'administrator') {
      if (user.status === UserStatusEnum.REJECTED) {
        throw new BadRequestException(
          'Unfortunately, your registration request has been refused. To know the reason, you can write to the administrators at unic@dipintra.it',
        );
      } else if (user.status === UserStatusEnum.PENDING) {
        throw new BadRequestException(
          'Your registration request is pending. You will receive an email when your registration will be approved.',
        );
      }
    }

    const payload = { user_uuid: user.user_uuid };
    return await this.jwtService.signAsync(payload);
  }

  async findUserHasCorporaAsign(userUuid: string, corporaUuid: string) {
    return (
      await this.db
        .select()
        .from(usersCorporaLogsTable)
        .where(
          and(
            eq(usersCorporaLogsTable.user_uuid, userUuid),
            eq(usersCorporaLogsTable.corpora_uuid, corporaUuid),
          ),
        )
    )[0];
  }
}
