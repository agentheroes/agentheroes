import { Injectable } from "@nestjs/common";
import { PrismaRepository } from "@packages/backend/database/prisma/prisma";
import { GenerateModelDto } from "@packages/shared/dto/models/generate.model.dto";
import { Type } from "@prisma/client";
import { MediaDto } from "@packages/shared/dto/media/media.dto";

@Injectable()
export class MediaRepository {
  constructor(private _media: PrismaRepository<"media">) {}

  saveMedia(
    orgId: string,
    characterId: string | null,
    prompt: string,
    type: Type,
    url: string,
    originalUrl?: string,
  ) {
    return this._media.model.media.create({
      data: {
        organizationId: orgId,
        characterId,
        prompt,
        media: url,
        type,
        originalUrl,
      },
    });
  }

  async getAllMedia(orgId: string, body: MediaDto) {
    const where = {
      organizationId: orgId,
      deletedAt: null as any,
    };

    const count = await this._media.model.media.count({
      where,
    });

    const media = await this._media.model.media.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
      skip: 10 * (+(body.page || 1) - 1),
    });

    return {
      count: Math.ceil(count / 10),
      media,
    };
  }

  deleteMedia(orgId: string, mediaId: string) {
    return this._media.model.media.update({
      where: {
        id: mediaId,
        organizationId: orgId,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
