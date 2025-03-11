import { Injectable, NotFoundException } from "@nestjs/common";
import { providersList } from "@packages/backend/generations/providers.list";
import { EncryptionService } from "@packages/backend/encryption/encryption.service";
import { GenerationBaseInterface } from "@packages/backend/generations/generation.base.interface";
import {ModelsRepository} from "@packages/backend/database/models/models.repository";

@Injectable()
export class GenerationService {
  constructor(private _modelsRepository: ModelsRepository) {}

  async providerAndApiKey(model: string) {
    const findProvider = providersList.find((p) =>
      p.models.some((p) => p.model === model),
    );
    if (!findProvider) {
      throw new NotFoundException();
    }

    const findApi = await this._modelsRepository.getModelsByIdentifier(
      findProvider.identifier,
    );
    if (!findApi) {
      throw new NotFoundException();
    }

    if (!JSON.parse(findApi.models).some((p: string) => p === model)) {
      throw new NotFoundException();
    }

    const apiKey = (EncryptionService.verifyJWT(findApi.apiKey) as any).key;

    return {
      provider: findProvider as GenerationBaseInterface,
      apiKey,
    };
  }

  async generatePicture(
    model: string,
    text: string,
    total: number,
    seed?: number,
  ) {
    const providerAndApiKey = await this.providerAndApiKey(model);
    const generate = await providerAndApiKey.provider.generateImage(
      providerAndApiKey.apiKey,
      model,
      text,
      total,
      seed,
    );

    return generate;
  }

  async generateLookALike(
      model: string,
      text: string,
      image: string,
      total: number,
      seed?: number,
  ) {
    const providerAndApiKey = await this.providerAndApiKey(model);
    const generate = await providerAndApiKey.provider.generateLookALikeImages(
        providerAndApiKey.apiKey,
        model,
        text,
        total,
        image,
        seed,
    );

    // @ts-ignore
    return generate;
  }
}
