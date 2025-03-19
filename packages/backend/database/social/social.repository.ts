import { Injectable } from "@nestjs/common";
import { PrismaRepository } from "@packages/backend/database/prisma/prisma";
import { Channels } from "@prisma/client";
import { CheckSocialsList } from "@packages/shared/dto/socials.dto";
import { EncryptionService } from "@packages/backend/encryption/encryption.service";
import { CalendarPosts } from "@packages/shared/dto/socials/calendar.posts.dto";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import {
  PostCreateDto,
  PostListItemDto,
} from "@packages/shared/dto/socials/post.create.dto";
import { v4 as uuidv4 } from "uuid";

dayjs.extend(utc);

@Injectable()
export class SocialRepository {
  constructor(
    private _socialAuth: PrismaRepository<"socialAuth">,
    private _channel: PrismaRepository<"channels">,
    private _posts: PrismaRepository<"posts">,
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
    info: Omit<Channels, "createdAt" | "updatedAt" | "deletedAt" | "id">,
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
        organizationId_rootInternalId_currentInternalId: {
          organizationId: org,
          rootInternalId: info.rootInternalId,
          currentInternalId: info.rootInternalId,
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

  getOrganizationsSocials(orgId: string) {
    return this._channel.model.channels.findMany({
      where: {
        organizationId: orgId,
        deletedAt: null,
      },
      select: {
        id: true,
        identifier: true,
        name: true,
        profilePic: true,
      },
    });
  }

  getOrganizationsPosts(orgId: string, body: CalendarPosts) {
    return this._posts.model.posts.findMany({
      where: {
        organizationId: orgId,
        order: 1,
        date: {
          gte: dayjs.utc(body.startDate).startOf('day').toDate(),
          lte: dayjs.utc(body.endDate).endOf('day').add(1, 'minute').toDate(),
        },
        deletedAt: null,
      },
    });
  }

  async getAllPostsPerGroup(orgId: string, group: string) {
    return (await this._posts.model.posts.findMany({
      where: {
        organizationId: orgId,
        group
      },
      orderBy: {
        order: 'asc'
      }
    })).map(p => ({
      ...p,
      media: JSON.parse(p.media)
    }))
  }

  async savePost(orgId: string, posts: PostCreateDto) {
    for (const item of posts.list) {
      const group = uuidv4();
      for (const body of item.posts) {
        const uuid = uuidv4();

        const data = {
          order: body.order,
          group,
          organization: {
            connect: {
              id: orgId,
            },
          },
          channel: {
            connect: {
              organizationId: orgId,
              id: item.channel,
            },
          },
          type: posts.type,
          content: body.text,
          media: JSON.stringify(body.media),
          date: dayjs.utc(posts.date).toDate(),
          id: body.id || uuid,
        };

        await this._posts.model.posts.upsert({
          where: {
            id_order: {
              id: body.id || uuid,
              order: body.order,
            },
            organizationId: orgId,
          },
          create: {
            ...data,
          },
          update: {
            ...data,
          },
        });
      }
    }

    return {
      saved: true,
    };
  }
}
