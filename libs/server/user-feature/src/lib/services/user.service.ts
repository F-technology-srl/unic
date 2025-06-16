import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DrizzleUnic, InjectDrizzle, usersTable } from '@unic/database';
import {
  CreateUserDto,
  UpdateUserStatusDto,
  UserDto,
} from '@unic/shared/user-dto';
import { eq, isNull, and } from 'drizzle-orm';
import { CryptService } from '@unic/server/authentication-feature';
import { UserStatusEnum } from '@unic/shared/database-dto';

@Injectable()
export class UserService {
  constructor(
    @InjectDrizzle() private db: DrizzleUnic,
    private cryptService: CryptService,
  ) {}
  private selectUserQuery() {
    return this.db
      .select({
        user_uuid: usersTable.user_uuid,
        first_name: usersTable.first_name,
        last_name: usersTable.last_name,
        profession: usersTable.profession,
        institution: usersTable.institution,
        explanation: usersTable.explanation,
        email: usersTable.email,
        platform_role: usersTable.platform_role,
        status: usersTable.status,
        // name: usersTable.name,
        // country: usersTable.country,
        // profile_image_repository_asset_uuid: usersTable.profile_image_repository_asset_uuid,
        created_at: usersTable.created_at,
        updated_at: usersTable.updated_at,
        deleted_at: usersTable.deleted_at,
        status_updated_at: usersTable.status_updated_at,
        verified_at: usersTable.verified_at,
        status_updated_by: usersTable.status_updated_by,
      })
      .from(usersTable)
      .$dynamic();
  }

  async findOne(email: string) {
    return (
      await this.selectUserQuery().where(
        and(eq(usersTable.email, email), isNull(usersTable.deleted_at)),
      )
    )[0];
  }

  async getUsers() {
    const users = await this.db.query.usersTable.findMany();
    console.log('users', users);
    return users;
  }

  async getUserByEmail(email: string) {
    const user = await this.db.query.usersTable.findFirst({
      where: eq(usersTable.email, email),
    });

    return user || null;
  }

  async updatePassword(user: UserDto, newPassword: string) {
    const { salt, hash } = await this.cryptService.hashPassword(newPassword);

    return await this.db
      .update(usersTable)
      .set({
        password: hash,
        salt,
        updated_at: new Date(),
      })
      .where(eq(usersTable.user_uuid, user.user_uuid));
  }

  async findOneByUUID(uuid: string) {
    return (
      await this.selectUserQuery().where(
        and(eq(usersTable.user_uuid, uuid), isNull(usersTable.deleted_at)),
      )
    )[0];
  }

  async getUserByUUID(user_uuid: string): Promise<UserDto> {
    const user = await this.db.query.usersTable.findFirst({
      where: eq(usersTable.user_uuid, user_uuid),
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async createUser(options: {
    createUserDto: CreateUserDto;
    userRole: 'standard' | 'administrator';
  }) {
    const user = await this.db.transaction(async (tx) => {
      const { hash, salt } = this.cryptService.hashPassword(
        options.createUserDto.password,
      );
      const newUser = await tx
        .insert(usersTable)
        .values({
          ...options.createUserDto,
          salt: salt,
          platform_role: options.userRole,
          password: hash,
        })
        .returning();

      return {
        user: newUser[0],
      };
    });
    if (!user) {
      throw new BadRequestException('User not created');
    }

    return user?.user;
  }

  async updateUser(user: UserDto, updateUser: UpdateUserStatusDto) {
    if (user.status !== UserStatusEnum.PENDING) {
      throw new BadRequestException('Invalid status');
    }

    await this.db
      .update(usersTable)
      .set({
        status: updateUser.status,
        updated_at: new Date(),
      })
      .where(eq(usersTable.user_uuid, user.user_uuid));

    return this.getUserByUUID(user.user_uuid);
  }

  async updateUserStatus(options: {
    user_uuid: string;
    status: UserStatusEnum;
  }) {
    const { user_uuid, status } = options;

    const updatedUser = await this.db.transaction(async (tx) => {
      const updatedUser = await tx
        .update(usersTable)
        .set({
          status,
          status_updated_at: new Date(),
          updated_at: new Date(),
        })
        .where(eq(usersTable.user_uuid, user_uuid))
        .returning();

      return updatedUser[0];
    });

    return updatedUser;
  }

  async verifyUserEmail(user_uuid: string) {
    try {
      await this.db
        .update(usersTable)
        .set({ verified_at: new Date(), updated_at: new Date() })
        .where(eq(usersTable.user_uuid, user_uuid));
    } catch (error) {
      throw new BadRequestException('Unable to update user verification token');
    }
  }

  async userDelete(user_uuid: string) {
    await this.db.delete(usersTable).where(eq(usersTable.user_uuid, user_uuid));
  }

  validUsername = new RegExp('^[a-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,4}$');
  async validateUsername(email: string) {
    const lowercaseEmail = email.trim().toLowerCase();
    if (!this.validUsername.test(lowercaseEmail)) {
      throw new BadRequestException('The username is not valid');
    }
    const countTaken = await this.getUserByEmail(lowercaseEmail);
    if (countTaken) {
      throw new BadRequestException('The username is already taken');
    }
    return lowercaseEmail;
  }
}
