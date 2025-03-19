import { Injectable } from "@nestjs/common";
import { SocialRepository } from "@packages/backend/database/social/social.repository";
import { Channels, PostStatus } from "@prisma/client";
import { SchedulerList } from "@packages/backend/scheduler/scheduler.list";
import { EncryptionService } from "@packages/backend/encryption/encryption.service";
import { CheckSocialsList } from "@packages/shared/dto/socials.dto";
import { CalendarPosts } from "@packages/shared/dto/socials/calendar.posts.dto";
import { PostCreateDto } from "@packages/shared/dto/socials/post.create.dto";
import { BullMqClient } from "@packages/backend/bull-mq-transport-new/client";
import dayjs from "dayjs";

export interface SavePostDetails {
  id: string;
  internalId?: string;
  error?: string;
  status: PostStatus;
}

@Injectable()
export class SocialService {
  constructor(
    private _socialRepository: SocialRepository,
    private _workerServiceProducer: BullMqClient,
  ) {}

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

  // delete only the post from the queue (not from db)
  private async deletePost(group: string) {
    await this._workerServiceProducer.delete("post", group);
  }

  // Schedule post only at the queue level (not from db)
  private async schedulePost(group: string, date: string) {
    const delay = dayjs.utc(date).diff(dayjs(), "millisecond");
    this._workerServiceProducer.emit("post", {
      id: group,
      options: {
        delay: delay < 0 ? 0 : delay,
      },
      payload: {
        id: group,
        delay: delay < 0 ? 0 : delay,
      },
    });
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
    const groups = await this._socialRepository.savePost(orgId, body);
    for (const group of groups) {
      await this.deletePost(group);
      await this.schedulePost(group, body.date);
    }

    return groups;
  }

  async getAllPostsPerGroup(orgId: string, id: string) {
    return this._socialRepository.getAllPostsPerGroup(orgId, id);
  }

  async changePostDate(orgId: string, group: string, date: string) {
    await this._socialRepository.changePostDate(orgId, group, date);
    await this.deletePost(group);
    await this.schedulePost(group, date);
  }

  async deletePostsByGroup(orgId: string, group: string) {
    await this._socialRepository.deletePostsByGroup(orgId, group);
    await this.deletePost(group);
    return { success: true };
  }

  async getPostsByGroup(group: string) {
    return this._socialRepository.getPostsByGroup(group);
  }

  async updatePostStatuses(params: SavePostDetails[]) {
    return this._socialRepository.updatePostStatuses(params);
  }
}
