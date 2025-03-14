import { Injectable } from "@nestjs/common";
import { MediaRepository } from "@packages/backend/database/media/media.repository";
import { Type } from "@prisma/client";

@Injectable()
export class MediaService {
  constructor(private _mediaRepository: MediaRepository) {}

  saveMedia(
    orgId: string,
    characterId: string,
    prompt: string,
    type: Type,
    url: string,
  ) {
    return this._mediaRepository.saveMedia(
      orgId,
      characterId,
      prompt,
      type,
      url,
    );
  }

  getAllMedia(orgId: string) {
    return this._mediaRepository.getAllMedia(orgId);
  }

  deleteMedia(orgId: string, mediaId: string) {
    return this._mediaRepository.deleteMedia(orgId, mediaId);
  }
}
