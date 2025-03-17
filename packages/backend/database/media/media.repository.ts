import { Injectable } from "@nestjs/common";
import { PrismaRepository } from "@packages/backend/database/prisma/prisma";
import { GenerateModelDto } from "@packages/shared/dto/models/generate.model.dto";
import { Type } from "@prisma/client";

@Injectable()
export class MediaRepository {
  constructor(private _media: PrismaRepository<"media">) {}

  saveMedia(
    orgId: string,
    characterId: string | null,
    prompt: string,
    type: Type,
    url: string,
  ) {
    return this._media.model.media.create({
      data: {
        organizationId: orgId,
        characterId,
        prompt,
        media: url,
        type,
      },
    });
  }

  getAllMedia(orgId: string) {
    return this._media.model.media.findMany({
      where: {
        organizationId: orgId,
        deletedAt: null,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
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
