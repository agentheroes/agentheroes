import { Role } from "@prisma/client";
import { Injectable } from "@nestjs/common";
import { PrismaRepository } from "@packages/backend/database/prisma/prisma";
import { CreateOrgUserDto } from "@packages/shared/dto/auth/create.org.user.dto";
import { EncryptionService } from "@packages/backend/encryption/encryption.service";

@Injectable()
export class OrganizationRepository {
  constructor(
    private _organization: PrismaRepository<"organization">,
    private _userOrg: PrismaRepository<"userOrganization">,
    private _models: PrismaRepository<"models">,
  ) {}

  getCount() {
    return this._organization.model.organization.count();
  }

  async getOrgsByUserId(userId: string) {
    return this._organization.model.organization.findMany({
      where: {
        users: {
          some: {
            userId,
          },
        },
      },
      include: {
        users: {
          where: {
            userId,
          },
          select: {
            disabled: true,
            role: true,
            organization: {
              select: {
                credits: true,
              },
            },
          },
        },
      },
    });
  }

  async createOrgAndUser(
    body: Omit<CreateOrgUserDto, "providerToken"> & { providerId?: string },
    hasEmail: boolean,
  ) {
    const totalUsers = await this.getCount();
    return this._organization.model.organization.create({
      data: {
        allowTrial: true,
        users: {
          create: {
            role: Role.SUPERADMIN,
            user: {
              create: {
                isSuperAdmin: totalUsers === 0,
                activated: body.provider !== "LOCAL" || !hasEmail,
                email: body.email,
                password: body.password
                  ? EncryptionService.hashPassword(body.password)
                  : "",
                providerName: body.provider,
                providerId: body.providerId || "",
              },
            },
          },
        },
      },
      select: {
        id: true,
        users: {
          select: {
            user: true,
          },
        },
      },
    });
  }

  async addUserToOrg(
    userId: string,
    id: string,
    orgId: string,
    role: "USER" | "ADMIN",
  ) {
    const create = await this._userOrg.model.userOrganization.create({
      data: {
        role,
        userId,
        organizationId: orgId,
      },
    });

    return create;
  }

  async addCredits(org: string, id: string, credits: number) {
    return this._organization.model.organization.update({
      where: {
        id: org,
      },
      data: {
        lastId: id,
        credits: {
          increment: credits,
        },
      },
    });
  }
}
