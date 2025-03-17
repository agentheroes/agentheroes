import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ModelsService } from "@packages/backend/database/models/models.service";
import { GenerateModelDto } from "@packages/shared/dto/models/generate.model.dto";
import { GenerationCategory } from "@packages/backend/generations/generation.category";
import { GetOrganizationFromRequest } from "@backend/services/auth/org.from.request";
import { Organization } from "@prisma/client";
import { GenerateCharacterDto } from "@packages/shared/dto/models/generate.character.dto";

@Controller("/models")
export class ModelsController {
  constructor(private _modelsService: ModelsService) {}

  @Get("/")
  async list() {
    return this._modelsService.getModelsForClient(false);
  }

  @Post("/generate")
  async generate(
    @GetOrganizationFromRequest() org: Organization,
    @Body() data: GenerateModelDto,
  ) {
    switch (data.type) {
      case GenerationCategory.NORMAL_IMAGE:
        return { generated: await this._modelsService.generateImage(data) };
      case GenerationCategory.LOOK_A_LIKE_IMAGE:
        return { generated: await this._modelsService.generateLookALike(data) };
      case GenerationCategory.VIDEO:
        return { generated: await this._modelsService.generateVideo(data) };
      case GenerationCategory.TRAINER:
        return {
          generated: await this._modelsService.trainModel(org.id, data),
        };
    }
  }

  @Post("/generate/:characterId")
  async generateCharacter(
    @GetOrganizationFromRequest() org: Organization,
    @Body() data: GenerateCharacterDto,
    @Param("characterId") characterId: string,
  ) {
    return {
      generated: await this._modelsService.generateCharacter(
        org.id,
        characterId,
        data,
      ),
    };
  }
}
