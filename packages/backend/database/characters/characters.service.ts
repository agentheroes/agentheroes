import { Injectable } from "@nestjs/common";
import { GenerateModelDto } from "@packages/shared/dto/models/generate.model.dto";
import { Status } from "@prisma/client";
import { CharactersRepository } from "@packages/backend/database/characters/characters.repository";
import { UploadService } from "@packages/backend/upload/upload.service";
import { uploadDomain } from "@packages/shared/utils/upload.domain";

@Injectable()
export class CharactersService {
  constructor(
    private _charactersRepository: CharactersRepository,
    private _uploadService: UploadService,
  ) {}

  async sendForTraining(refer: string, orgId: string, model: GenerateModelDto) {
    const uploadBaseImage =
      uploadDomain(refer) +
      (await this._uploadService.service.uploadSimple(model.baseImage));

    return this._charactersRepository.createTraining(orgId, model);
  }

  async getCharacterById(id: string) {
    return this._charactersRepository.getCharacterById(id);
  }

  async updateLora(id: string, lora: string, status: Status) {
    return this._charactersRepository.updateLora(id, lora, status);
  }

  async getAllCharacters(orgId: string) {
    return this._charactersRepository.getAllCharacters(orgId);
  }

  async deleteCharacter(orgId: string, id: string) {
    return this._charactersRepository.deleteCharacter(orgId, id);
  }
}
