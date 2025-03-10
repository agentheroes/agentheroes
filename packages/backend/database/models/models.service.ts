import { Injectable } from "@nestjs/common";
import { ModelsRepository } from "@packages/backend/database/models/models.repository";
import { GenerationIdentifiers } from "@packages/shared/generations/generation.identifiers";
import { videoGenerationList } from "@packages/shared/generations/video-generation/video-generation.list";
import { imageGenerationList } from "@packages/shared/generations/image-generation/image-generation.list";
import { SetupDto } from "@packages/shared/dto/setup/setup.dto";
import {HttpBadRequestException} from "@packages/backend/exceptions/http.exceptions";

@Injectable()
export class ModelsService {
  constructor(private _modelsRepository: ModelsRepository) {}

  getAllModels() {
    return [...videoGenerationList, ...imageGenerationList];
  }

  async checkModelApi(provider: GenerationIdentifiers, api: string) {
    const list = this.getAllModels().find((p) => p.identifier === provider);
    if (!list) {
      return false;
    }

    return list.testConnection(api);
  }

  async saveSettings(organizationId: string, settings: SetupDto) {
    for (const setting of settings.list) {
      if (!(await this.checkModelApi(setting.identifier, setting.apiKey))) {
        throw new HttpBadRequestException();
      }
    }

    return this._modelsRepository.saveSettings(organizationId, settings);
  }
}
