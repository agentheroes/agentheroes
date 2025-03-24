import { Injectable } from "@nestjs/common";
import { ModelsRepository } from "@packages/backend/database/models/models.repository";
import { GenerationIdentifiers } from "@packages/backend/generations/generation.identifiers";
import { SetupDto } from "@packages/shared/dto/setup/setup.dto";
import { HttpBadRequestException } from "@packages/backend/exceptions/http.exceptions";
import { providersList } from "@packages/backend/generations/providers.list";
import { EncryptionService } from "@packages/backend/encryption/encryption.service";
import { groupBy } from "lodash";
import { GenerateModelDto } from "@packages/shared/dto/models/generate.model.dto";
import { GenerationService } from "@packages/backend/generations/generation.service";
import { BullMqClient } from "@packages/backend/bull-mq-transport-new/client";
import { Status } from "@prisma/client";
import { GenerateCharacterDto } from "@packages/shared/dto/models/generate.character.dto";
import { CharactersService } from "@packages/backend/database/characters/characters.service";
import { MediaService } from "@packages/backend/database/media/media.service";
import { GenerationCategory } from "@packages/backend/generations/generation.category";

@Injectable()
export class ModelsService {
  constructor(
    private _modelsRepository: ModelsRepository,
    private _generationService: GenerationService,
    private _charactersService: CharactersService,
    private _mediaService: MediaService,
    private _workerServiceProducer: BullMqClient,
  ) {}

  getAllModels() {
    return [...providersList];
  }

  async getModelsForClient(includePassword?: boolean) {
    const models = (await this._modelsRepository.getModels()).map(
      ({ apiKey, ...all }) => {
        const provider = providersList.find(
          (p) => p.identifier === all.container,
        );
        return {
          ...all,
          docs: provider.docsLink,
          ...(includePassword
            ? { apiKey: (EncryptionService.verifyJWT(apiKey) as any).key }
            : {}),
        };
      },
    );

    const all = providersList.flatMap((p) =>
      p.models
        .map((m) => ({ ...m, identifier: p.identifier }))
        .filter((f) => {
          if (includePassword) {
            return true;
          }

          return !!models.find(
            (p) => JSON.parse(p.models).indexOf(f.model) > -1,
          );
        }),
    );

    const list = {
      ...Object.values(GenerationCategory).reduce(
        (all, current) => ({
          ...all,
          [current]: [],
        }),
        {} as any,
      ),
      ...groupBy(all, (p) => p.category),
    };

    return {
      models,
      list,
    };
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

  async generateImage(data: GenerateModelDto) {
    return this._generationService.generatePicture(data.model, data.prompt, 1);
  }

  async getTextModel(data: Required<Pick<GenerateModelDto, "model">>) {
    return this._generationService.getTextModel(data.model);
  }

  async generateVideo(data: GenerateModelDto) {
    return this._generationService.generateVideo(
      data.model,
      data.prompt,
      data.image,
      1,
    );
  }

  async generateLookALike(data: GenerateModelDto) {
    return this._generationService.generateLookALike(
      data.model,
      data.prompt,
      data.image,
      1,
    );
  }

  async trainModel(refer: string, orgId: string, data: GenerateModelDto) {
    const { id } = await this._charactersService.sendForTraining(
      refer,
      orgId,
      data,
    );

    this._workerServiceProducer.emit("train", {
      id: `train-${id}`,
      payload: {
        id,
      },
    });

    return { id };
  }

  async processTrainModel(id: string) {
    const loadCharacter = await this._charactersService.getCharacterById(id);
    if (!loadCharacter) {
      return;
    }

    try {
      const lora = await this._generationService.trainCharacter(
        loadCharacter.models,
        JSON.parse(loadCharacter.images),
      );

      return this._charactersService.updateLora(id, lora, Status.COMPLETED);
    } catch (err) {
      console.log(err);
      return this._charactersService.updateLora(id, "", Status.FAILED);
    }
  }

  async generateCharacter(
    refer: string,
    orgId: string,
    characterId: string,
    data: GenerateCharacterDto,
  ) {
    const character =
      await this._charactersService.getCharacterById(characterId);

    if (!character || character?.organizationId !== orgId) {
      throw new HttpBadRequestException();
    }

    const url = await this._generationService.generateCharacter(
      character,
      data,
    );

    return this._mediaService.saveMedia(
      refer,
      orgId,
      data.prompt,
      data.type,
      url,
      characterId,
    );
  }
}
