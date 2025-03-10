import { Global, Module } from "@nestjs/common";
import { OrganizationService } from "@packages/backend/database/organizations/organization.service";
import { OrganizationRepository } from "@packages/backend/database/organizations/organization.repository";
import { UsersService } from "@packages/backend/database/users/users.service";
import { UsersRepository } from "@packages/backend/database/users/users.repository";
import {
  PrismaRepository,
  PrismaService,
} from "@packages/backend/database/prisma/prisma";
import { ModelsRepository } from "@packages/backend/database/models/models.repository";
import { ModelsService } from "@packages/backend/database/models/models.service";

@Global()
@Module({
  imports: [],
  controllers: [],
  providers: [
    PrismaService,
    PrismaRepository,
    OrganizationService,
    OrganizationRepository,
    UsersService,
    UsersRepository,
    ModelsRepository,
    ModelsService,
  ],
  get exports() {
    return [...this.providers];
  },
})
export class DatabaseModule {}
