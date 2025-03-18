import { Injectable } from "@nestjs/common";
import { SocialRepository } from "@packages/backend/database/social/social.repository";
import { Channels } from "@prisma/client";
import { SchedulerList } from "@packages/backend/scheduler/scheduler.list";
import {EncryptionService} from "@packages/backend/encryption/encryption.service";

@Injectable()
export class SocialService {
  constructor(private _socialRepository: SocialRepository) {}

  getKeys(identifier: string) {
    return this._socialRepository.getKeys(identifier);
  }

  async getSocialsInformation(includePassword: boolean) {
    const list = await this._socialRepository.getSocialsInformation();
    return {
      saved: list.map(({ privateKey, publicKey, ...all }) => ({
        ...all,
        ...(includePassword
          ? {
              privateKey: EncryptionService.verifyJWT(privateKey),
              publicKey: EncryptionService.verifyJWT(privateKey),
            }
          : {}),
      })),
      inSystem: SchedulerList.map((p) => p.identifier),
    };
  }

  save(
    org: string,
    info: Omit<Channels, "createdAt" | "updatedAt" | "deletedAt">,
  ) {
    return this._socialRepository.save(org, info);
  }
}
