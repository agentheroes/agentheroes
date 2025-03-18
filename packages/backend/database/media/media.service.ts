import { Injectable } from "@nestjs/common";
import { MediaRepository } from "@packages/backend/database/media/media.repository";
import { Type } from "@prisma/client";
import { UploadService } from "@packages/backend/upload/upload.service";
import { MediaDto } from "@packages/shared/dto/media/media.dto";

@Injectable()
export class MediaService {
  constructor(
    private _mediaRepository: MediaRepository,
    private _uploadService: UploadService,
  ) {}

  async saveMedia(
    orgId: string,
    prompt: string,
    type: Type,
    url: string,
    characterId?: string,
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

  getAllMedia(orgId: string, body: MediaDto) {
    return this._mediaRepository.getAllMedia(orgId, body);
  }

  deleteMedia(orgId: string, mediaId: string) {
    return this._mediaRepository.deleteMedia(orgId, mediaId);
  }
}
