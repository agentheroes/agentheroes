import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { groupBy } from "lodash";
import { GetOrganizationFromRequest } from "@backend/services/auth/org.from.request";
import { Organization } from "@prisma/client";
import { OrganizationService } from "@packages/backend/database/organizations/organization.service";
import { IsSuperAdminGuard } from "@backend/services/auth/is.super.admin";
import { ModelsService } from "@packages/backend/database/models/models.service";
import { GenerationIdentifiers } from "@packages/backend/generations/generation.identifiers";
import { SetupDto } from "@packages/shared/dto/setup/setup.dto";
import { EncryptionService } from "@packages/backend/encryption/encryption.service";
import { providersList } from "@packages/backend/generations/providers.list";

@Controller("/setup")
@IsSuperAdminGuard()
export class SetupController {
  constructor(
    private _organizationService: OrganizationService,
    private _modelsService: ModelsService,
  ) {}

  @Get("/")
  async list(@GetOrganizationFromRequest() organization: Organization) {
    const all = providersList.flatMap((p) =>
      p.models.map((m) => ({ ...m, identifier: p.identifier })),
    );

    const models = (
      await this._organizationService.getModels(organization.id)
    ).map((p) => {
      return {
        ...p,
        apiKey: (EncryptionService.verifyJWT(p.apiKey) as any).key,
      };
    });
    const list = groupBy(all, (p) => p.category);

    return {
      models,
      list,
    };
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
