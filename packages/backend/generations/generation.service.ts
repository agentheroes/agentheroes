import { Injectable, NotFoundException } from "@nestjs/common";
import { providersList } from "@packages/backend/generations/providers.list";
import { EncryptionService } from "@packages/backend/encryption/encryption.service";
import { GenerationBaseInterface } from "@packages/backend/generations/generation.base.interface";
import { ModelsRepository } from "@packages/backend/database/models/models.repository";
import { Characters } from "@prisma/client";
import { GenerateCharacterDto } from "@packages/shared/dto/models/generate.character.dto";

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
    const generate = await providerAndApiKey.provider.generateImage({
      apiKey: providerAndApiKey.apiKey,
      model,
      text,
      total,
      seed,
    });

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
    const generate = await providerAndApiKey.provider.generateLookALikeImages({
      apiKey: providerAndApiKey.apiKey,
      model: model,
      text: text,
      total: total,
      image: image,
      seed: seed,
    });

    // @ts-ignore
    return generate;
  }

  async trainCharacter(model: string, images: string[]) {
    const providerAndApiKey = await this.providerAndApiKey(model);
    return providerAndApiKey.provider.trainImages({
      apiKey: providerAndApiKey.apiKey,
      model: model,
      images,
      total: 1,
    });
  }

  async generateCharacter(character: Characters, data: GenerateCharacterDto) {
    const providerAndApiKey = await this.providerAndApiKey(character.models);

    const image = await providerAndApiKey.provider.generateInferenceImage({
      apiKey: providerAndApiKey.apiKey,
      prompt: data.prompt,
      lora: character.lora,
      model: providerAndApiKey.provider.models.find(
        (p) => p.model === character.models,
      ).inferenceModel,
    });

    const video =
      data.type === "video"
        ? (await providerAndApiKey.provider.generateVideo({
            apiKey: providerAndApiKey.apiKey,
            model: character.models,
            text: data.prompt,
            total: 1,
          })) as unknown
        : null;

    return {
      image: image as string,
      video: video as string|undefined,
    }
  }
}
