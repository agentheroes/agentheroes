import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { GetOrganizationFromRequest } from "@backend/services/auth/org.from.request";
import { Organization } from "@prisma/client";
import { IsSuperAdminGuard } from "@backend/services/auth/is.super.admin";
import { ModelsService } from "@packages/backend/database/models/models.service";
import { GenerationIdentifiers } from "@packages/backend/generations/generation.identifiers";
import { SetupDto } from "@packages/shared/dto/setup/setup.dto";

@Controller("/setup")
@IsSuperAdminGuard()
export class SetupController {
  constructor(
    private _modelsService: ModelsService,
  ) {}

  @Get("/")
  async list() {
    return this._modelsService.getModelsForClient(true);
  }

  @Post("/status/:provider")
  async provider(
    @GetOrganizationFromRequest() organization: Organization,
    @Param("provider") provider: GenerationIdentifiers,
    @Body("key") key: string,
  ) {
    return {
      valid: await this._modelsService.checkModelApi(provider, key),
    };
  }

  @Post("/")
  async saveSettings(
    @GetOrganizationFromRequest() organization: Organization,
    @Body() body: SetupDto,
  ) {
    return this._modelsService.saveSettings(organization.id, body);
  }
}
