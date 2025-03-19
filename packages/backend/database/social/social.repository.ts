import { Injectable } from "@nestjs/common";
import { PrismaRepository } from "@packages/backend/database/prisma/prisma";
import { Channels } from "@prisma/client";
import { CheckSocialsList } from "@packages/shared/dto/socials.dto";
import { EncryptionService } from "@packages/backend/encryption/encryption.service";
import { CalendarPosts } from "@packages/shared/dto/socials/calendar.posts.dto";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { PostCreateDto } from "@packages/shared/dto/socials/post.create.dto";
import { v4 as uuidv4 } from "uuid";
import { SavePostDetails } from "@packages/backend/database/social/social.service";

dayjs.extend(utc);

type GroupId = string;

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
    info: Omit<
      Channels,
      | "createdAt"
      | "updatedAt"
      | "deletedAt"
      | "id"
    >,
  ) {
    const extraDetails = {
      organizationId: org,
      name: info.name,
      username: info.username,
      profilePic: info.profilePic,
      currentInternalId: info.currentInternalId,
      rootInternalId: info.rootInternalId,
    };

    const details = {
      identifier: info.identifier,
      timezone: info.timezone,
      token: info.token,
      expiresIn: info.expiresIn,
      refreshToken: info.refreshToken,
      selectionRequired: info.selectionRequired,
      shouldRefresh: info.shouldRefresh,
    };

    return this._channel.model.channels.upsert({
      where: {
        organizationId_rootInternalId_currentInternalId: {
          organizationId: org,
          rootInternalId: info.rootInternalId,
          currentInternalId: info.currentInternalId,
        },
      },
      create: {
        ...(details as Channels),
        ...extraDetails,
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
        shouldRefresh: true,
        selectionRequired: true,
        rootInternalId: true,
        currentInternalId: true,
      },
    });
  }

  getOrganizationsPosts(orgId: string, body: CalendarPosts) {
    return this._posts.model.posts.findMany({
      where: {
        organizationId: orgId,
        order: 1,
        date: {
          gte: dayjs.utc(body.startDate).startOf("day").toDate(),
          lte: dayjs.utc(body.endDate).endOf("day").add(1, "minute").toDate(),
        },
        deletedAt: null,
      },
    });
  }

  async getAllPostsPerGroup(orgId: string, group: string) {
    return (
      await this._posts.model.posts.findMany({
        where: {
          organizationId: orgId,
          group,
        },
        orderBy: {
          order: "asc",
        },
      })
    ).map((p) => ({
      ...p,
      media: JSON.parse(p.media),
    }));
  }

  async changePostDate(orgId: string, group: string, date: string) {
    return this._posts.model.posts.updateMany({
      where: {
        organizationId: orgId,
        group,
      },
      data: {
        date,
      },
    });
  }

  async deletePostsByGroup(orgId: string, group: string) {
    return this._posts.model.posts.updateMany({
      where: {
        organizationId: orgId,
        group,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async getPostsByGroup(group: string) {
    return this._posts.model.posts.findMany({
      where: {
        group,
      },
      include: {
        channel: true,
      },
    });
  }

  async savePost(orgId: string, posts: PostCreateDto): Promise<GroupId[]> {
    const groupList: GroupId[] = [];
    for (const item of posts.list) {
      const group = posts.group || uuidv4();
      groupList.push(group);
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
            id: body.id || uuid,
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

    return groupList;
  }

  async updatePostStatuses(params: SavePostDetails[]) {
    for (const param of params) {
      await this._posts.model.posts.update({
        where: {
          id: param.id,
        },
        data: {
          status: param.status,
          internalId: param.internalId,
          error: param.error,
        },
      });
    }
  }
}
