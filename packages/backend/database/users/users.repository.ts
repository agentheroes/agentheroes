import { Injectable } from "@nestjs/common";
import { Provider } from "@prisma/client";
import { PrismaRepository } from "@packages/backend/database/prisma/prisma";
import { EncryptionService } from "@packages/backend/encryption/encryption.service";

@Injectable()
export class UsersRepository {
  constructor(
    private _user: PrismaRepository<"user">,
    private _userOrganization: PrismaRepository<"userOrganization">,
  ) {}

  getUserById(id: string) {
    return this._user.model.user.findFirst({
      where: {
        id,
      },
    });
  }

  getUserByEmail(email: string) {
    return this._user.model.user.findFirst({
      where: {
        email,
        providerName: Provider.LOCAL,
      },
    });
  }

  activateUser(id: string) {
    return this._user.model.user.update({
      where: {
        id,
      },
      data: {
        activated: true,
      },
    });
  }

  getUserByProvider(providerId: string, provider: Provider) {
    return this._user.model.user.findFirst({
      where: {
        providerId,
        providerName: provider,
      },
    });
  }

  updatePassword(id: string, password: string) {
    return this._user.model.user.update({
      where: {
        id,
        providerName: Provider.LOCAL,
      },
      data: {
        password: EncryptionService.hashPassword(password),
      },
    });
  }

  getOrgUser(orgUserId: string) {
    return this._userOrganization.model.userOrganization.findFirst({
      where: {
        id: orgUserId,
      },
      select: {
        user: true,
        organizationId: true,
      },
    });
  }

  getAllUsers(search: string) {
    return this._userOrganization.model.userOrganization.findMany({
      where: {
        OR: [
          {
            id: { contains: search, mode: "insensitive" },
          },
          {
            user: {
              OR: [
                { id: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
                { name: { contains: search, mode: "insensitive" } },
              ],
            },
          },
        ],
      },
      select: {
        id: true,
        organizationId: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });
  }
}
