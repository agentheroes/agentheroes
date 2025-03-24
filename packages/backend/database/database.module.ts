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
import { MediaService } from "@packages/backend/database/media/media.service";
import { MediaRepository } from "@packages/backend/database/media/media.repository";
import { CharactersService } from "@packages/backend/database/characters/characters.service";
import { CharactersRepository } from "@packages/backend/database/characters/characters.repository";
import { SocialService } from "@packages/backend/database/social/social.service";
import { SocialRepository } from "@packages/backend/database/social/social.repository";
import { AgentsService } from "@packages/backend/database/agents/agents.service";
import { AgentsRepository } from "@packages/backend/database/agents/agents.repository";

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
    CharactersService,
    CharactersRepository,
    MediaService,
    MediaRepository,
    SocialService,
    SocialRepository,
    AgentsService,
    AgentsRepository,
  ],
  get exports() {
    return [...this.providers];
  },
})
export class DatabaseModule {}
