import { Injectable } from "@nestjs/common";
import { ModelsRepository } from "@packages/backend/database/models/models.repository";
import { GenerationIdentifiers } from "@packages/backend/generations/generation.identifiers";
import { SetupDto } from "@packages/shared/dto/setup/setup.dto";
import {HttpBadRequestException} from "@packages/backend/exceptions/http.exceptions";
import {providersList} from "@packages/backend/generations/providers.list";

@Injectable()
export class ModelsService {
  constructor(private _modelsRepository: ModelsRepository) {}

  getAllModels() {
    return [...providersList];
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

  async getModelsByIdentifier(identifier: string) {
    return this._modelsRepository.getModelsByIdentifier(identifier);
  }
}
