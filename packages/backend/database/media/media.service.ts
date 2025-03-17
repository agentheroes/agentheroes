import { Injectable } from "@nestjs/common";
import { MediaRepository } from "@packages/backend/database/media/media.repository";
import { Type } from "@prisma/client";
import { UploadService } from "@packages/backend/upload/upload.service";

@Injectable()
export class MediaService {
  constructor(
    private _mediaRepository: MediaRepository,
    private _uploadService: UploadService,
  ) {}

  async saveMedia(
    orgId: string,
    characterId: string,
    prompt: string,
    type: Type,
    url: string,
  ) {
    const upload = await this._uploadService.service.uploadSimple(url);
    return this._mediaRepository.saveMedia(
      orgId,
      characterId,
      prompt,
      type,
      upload,
    );
  }

  getAllMedia(orgId: string) {
    return this._mediaRepository.getAllMedia(orgId);
  }

  deleteMedia(orgId: string, mediaId: string) {
    return this._mediaRepository.deleteMedia(orgId, mediaId);
  }
}
