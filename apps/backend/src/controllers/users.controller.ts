import { Controller, Get } from "@nestjs/common";
import {GetUserFromRequest} from "@backend/services/auth/user.from.request";
import {User} from '@prisma/client';

@Controller("/users")
export class UsersController {
  constructor() {}

  @Get("/self")
  async self(
      @GetUserFromRequest() user: User,
  ) {
    return user;
  }
}
