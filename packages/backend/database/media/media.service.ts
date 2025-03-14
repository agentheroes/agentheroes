import { Injectable } from "@nestjs/common";
import { MediaRepository } from "@packages/backend/database/media/media.repository";

@Injectable()
export class MediaService {
  constructor(private _mediaRepository: MediaRepository) {}

  saveMedia(
    orgId: string,
    characterId: string,
    prompt: string,
    information: { image: string; video?: string },
  ) {
    return this._mediaRepository.saveMedia(orgId, characterId, prompt, information);
  }

  getAllMedia(orgId: string) {
    return this._mediaRepository.getAllMedia(orgId);
  }
}
