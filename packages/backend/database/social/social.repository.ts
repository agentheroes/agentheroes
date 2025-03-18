import { Injectable } from "@nestjs/common";
import { PrismaRepository } from "@packages/backend/database/prisma/prisma";
import { Channels } from "@prisma/client";
import { CheckSocialsList } from "@packages/shared/dto/socials.dto";
import { EncryptionService } from "@packages/backend/encryption/encryption.service";

@Injectable()
export class SocialRepository {
  constructor(
    private _socialAuth: PrismaRepository<"socialAuth">,
    private _channel: PrismaRepository<"channels">,
  ) {}

  getKeys(identifier: string) {
    return this._socialAuth.model.socialAuth.findFirst({
      where: {
        identifier,
      },
    });
  }

  async saveSocials(body: CheckSocialsList) {
    for (const social of body.socials) {
      await this._socialAuth.model.socialAuth.upsert({
        where: {
          identifier: social.identifier,
        },
        create: {
          identifier: social.identifier,
          privateKey: EncryptionService.signJWT({ key: social.privateKey }),
          publicKey: EncryptionService.signJWT({ key: social.publicKey }),
        },
        update: {
          privateKey: EncryptionService.signJWT({ key: social.privateKey }),
          publicKey: EncryptionService.signJWT({ key: social.publicKey }),
        },
      });
    }
  }

  save(
    org: string,
    info: Omit<Channels, "createdAt" | "updatedAt" | "deletedAt">,
  ) {
    const details = {
      identifier: info.identifier,
      timezone: info.timezone,
      username: info.username,
      name: info.name,
      token: info.token,
      expiresIn: info.expiresIn,
      profilePic: info.profilePic,
      refreshToken: info.refreshToken,
      rootInternalId: info.rootInternalId,
      currentInternalId: info.rootInternalId,
      selectionRequired: info.selectionRequired,
      organizationId: info.organizationId,
      shouldRefresh: info.shouldRefresh,
    };

    return this._channel.model.channels.upsert({
      where: {
        organizationId_rootInternalId: {
          organizationId: org,
          rootInternalId: info.rootInternalId,
        },
      },
      create: {
        ...details,
        createdAt: new Date(),
      },
      update: {
        ...details,
      },
    });
  }

  getSocialsInformation() {
    return this._socialAuth.model.socialAuth.findMany();
  }
}
