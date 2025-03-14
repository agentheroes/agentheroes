import { Injectable } from "@nestjs/common";
import { PrismaRepository } from "@packages/backend/database/prisma/prisma";
import { GenerateModelDto } from "@packages/shared/dto/models/generate.model.dto";
import { Status } from "@prisma/client";

@Injectable()
export class MediaRepository {
  constructor(private _media: PrismaRepository<"media">) {}

  saveMedia(
    orgId: string,
    characterId: string,
    prompt: string,
    information: { image: string; video?: string },
  ) {
    return this._media.model.media.create({
      data: {
        organizationId: orgId,
        characterId,
        prompt,
        image: information.image,
        video: information.video,
      },
    });
  }

  getAllMedia(orgId: string) {
    return this._media.model.media.findMany({
      where: {
        organizationId: orgId,
        deletedAt: null,
      },
    });
  }
}
