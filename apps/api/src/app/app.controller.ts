import { Controller, Get, InternalServerErrorException } from '@nestjs/common';
import { DrizzleUnic, InjectDrizzle } from '@unic/database';

@Controller()
export class AppController {
  constructor(@InjectDrizzle() private db: DrizzleUnic) {}

  @Get('/alive')
  async getData() {
    let dbAlive = false;
    try {
      await this.db.query.usersTable.findFirst();
      dbAlive = true;
    } catch (error) {
      console.error(error);
      dbAlive = false;
    }

    if (!dbAlive) {
      throw new InternalServerErrorException(
        'The application cannot reach the database'
      );
    }

    return {
      dbAlive,
    };
  }
}
