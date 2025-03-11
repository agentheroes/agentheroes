import { Body, Controller, Get, Post } from "@nestjs/common";
import { ModelsService } from "@packages/backend/database/models/models.service";
import { GenerateModelDto } from "@packages/shared/dto/models/generate.model.dto";
import { GenerationCategory } from "@packages/backend/generations/generation.category";

@Controller("/models")
export class ModelsController {
  constructor(private _modelsService: ModelsService) {}

  @Get("/")
  async list() {
    return this._modelsService.getModelsForClient(false);
  }

  @Post("/generate")
  async generate(@Body() data: GenerateModelDto) {
    switch (data.type) {
      case GenerationCategory.NORMAL_IMAGE:
        return { generated: await this._modelsService.generateImage(data) };
      case GenerationCategory.LOOK_A_LIKE_IMAGE:
        return { generated: await this._modelsService.generateLookALike(data) };
    }
  }
}
