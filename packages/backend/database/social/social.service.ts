import { Injectable } from "@nestjs/common";
import { SocialRepository } from "@packages/backend/database/social/social.repository";
import { Channels } from "@prisma/client";
import { SchedulerList } from "@packages/backend/scheduler/scheduler.list";
import { EncryptionService } from "@packages/backend/encryption/encryption.service";
import { CheckSocialsList } from "@packages/shared/dto/socials.dto";
import { CalendarPosts } from "@packages/shared/dto/socials/calendar.posts.dto";
import { PostCreateDto } from "@packages/shared/dto/socials/post.create.dto";

@Injectable()
export class SocialService {
  constructor(private _socialRepository: SocialRepository) {}

  async getKeys(identifier: string) {
    const keys = await this._socialRepository.getKeys(identifier);
    return {
      identifier: keys.identifier,
      privateKey: (EncryptionService.verifyJWT(keys.privateKey) as any).key,
      publicKey: (EncryptionService.verifyJWT(keys.publicKey) as any).key,
    };
  }

  async getSocialsInformation(includePassword: boolean) {
    const list = await this._socialRepository.getSocialsInformation();
    return {
      saved: list.map(({ privateKey, publicKey, ...all }) => ({
        ...all,
        name: SchedulerList.find((p) => p.identifier === all.identifier).name,
        ...(includePassword
          ? {
              privateKey: (EncryptionService.verifyJWT(privateKey) as any).key,
              publicKey: (EncryptionService.verifyJWT(publicKey) as any).key,
            }
          : {}),
      })),
      inSystem: SchedulerList.map((p) => p.identifier),
    };
  }

  async saveSocials(body: CheckSocialsList) {
    return this._socialRepository.saveSocials(body);
  }

  save(
    org: string,
    info: Omit<Channels, "createdAt" | "updatedAt" | "deletedAt" | "id">,
  ) {
    return this._socialRepository.save(org, info);
  }

  async getOrganizationsSocials(orgId: string) {
    return this._socialRepository.getOrganizationsSocials(orgId);
  }

  async getOrganizationsPosts(orgId: string, body: CalendarPosts) {
    return this._socialRepository.getOrganizationsPosts(orgId, body);
  }

  async savePost(orgId: string, body: PostCreateDto) {
    return this._socialRepository.savePost(orgId, body);
  }
}
