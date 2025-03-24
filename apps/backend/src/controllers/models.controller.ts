import { Body, Controller, Get, Headers, Param, Post } from "@nestjs/common";
import { ModelsService } from "@packages/backend/database/models/models.service";
import { GenerateModelDto } from "@packages/shared/dto/models/generate.model.dto";
import { GenerationCategory } from "@packages/backend/generations/generation.category";
import { GetOrganizationFromRequest } from "@backend/services/auth/org.from.request";
import { Organization } from "@prisma/client";
import { GenerateCharacterDto } from "@packages/shared/dto/models/generate.character.dto";
import { MediaService } from "@packages/backend/database/media/media.service";

@Controller("/models")
export class ModelsController {
  constructor(
    private _modelsService: ModelsService,
    private _mediaService: MediaService,
  ) {}

  @Get("/")
  async list() {
    return this._modelsService.getModelsForClient(false);
  }

  @Post("/generate")
  async generate(
    @GetOrganizationFromRequest() org: Organization,
    @Body() data: GenerateModelDto,
    @Headers("refer") refer: string,
  ) {
    if (data.type === GenerationCategory.TRAINER) {
      return {
        generated: await this._modelsService.trainModel(refer, org.id, data),
      };
    }

    let output: { generated: (string | Buffer<ArrayBufferLike>)[] };
    switch (data.type) {
      case GenerationCategory.NORMAL_IMAGE:
        output = { generated: await this._modelsService.generateImage(data) };
        break;
      case GenerationCategory.LOOK_A_LIKE_IMAGE:
        output = {
          generated: await this._modelsService.generateLookALike(data),
        };
        break;
      case GenerationCategory.VIDEO:
        output = {
          generated: await this._modelsService.generateVideo(data),
        };
        break;
    }

    if (data.saveAsMedia) {
      return {
        generated: (
          await Promise.all(
            output.generated.map((p) => {
              return this._mediaService.saveMedia(
                refer,
                org.id,
                data.prompt,
                data.type === "video" ? "VIDEO" : "IMAGE",
                p as string,
              );
            }),
          )
        ).map((p) => p.originalUrl),
      };
    }

    return output;
  }

  @Post("/generate/:characterId")
  async generateCharacter(
    @GetOrganizationFromRequest() org: Organization,
    @Body() data: GenerateCharacterDto,
    @Param("characterId") characterId: string,
    @Headers("refer") refer: string,
  ) {
    return {
      generated: await this._modelsService.generateCharacter(
        refer,
        org.id,
        characterId,
        data,
      ),
    };
  }
}
