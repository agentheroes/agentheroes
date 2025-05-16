import {
  Body,
  Controller,
  Get,
  Headers,
  HttpException,
  Param,
  Post,
} from "@nestjs/common";
import { ModelsService } from "@packages/backend/database/models/models.service";
import { GenerateModelDto } from "@packages/shared/dto/models/generate.model.dto";
import { GenerationCategory } from "@packages/backend/generations/generation.category";
import { GetOrganizationFromRequest } from "@backend/services/auth/org.from.request";
import { Organization } from "@prisma/client";
import { GenerateCharacterDto } from "@packages/shared/dto/models/generate.character.dto";
import { MediaService } from "@packages/backend/database/media/media.service";
import { calculateCredits } from "@packages/backend/payments/check.credits";
import { OrganizationService } from "@packages/backend/database/organizations/organization.service";

@Controller("/models")
export class ModelsController {
  constructor(
    private _modelsService: ModelsService,
    private _mediaService: MediaService,
    private _organizationService: OrganizationService,
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
    if (calculateCredits(org.credits, data.type) < 0) {
      throw new HttpException("Not enough credits", 402);
    }

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

    await this._organizationService.setCredits(
      org.id,
      calculateCredits(org.credits, data.type),
    );

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
    if (calculateCredits(org.credits, GenerationCategory.NORMAL_IMAGE) < 0) {
      throw new HttpException("Not enough credits", 402);
    }

    const obj = {
      generated: await this._modelsService.generateCharacter(
        refer,
        org.id,
        characterId,
        data,
      ),
    };

    await this._organizationService.setCredits(
      org.id,
      calculateCredits(org.credits, GenerationCategory.NORMAL_IMAGE),
    );

    return obj;
  }
}
