import {BadRequestException, Body, Controller, Get, HttpException, Param, Post} from "@nestjs/common";
import { GetOrganizationFromRequest } from "@backend/services/auth/org.from.request";
import { Organization } from "@prisma/client";
import { IsSuperAdminGuard } from "@backend/services/auth/is.super.admin";
import { ModelsService } from "@packages/backend/database/models/models.service";
import { GenerationIdentifiers } from "@packages/backend/generations/generation.identifiers";
import { SetupDto } from "@packages/shared/dto/setup/setup.dto";
import { SocialService } from "@packages/backend/database/social/social.service";
import { SchedulerService } from "@packages/backend/scheduler/scheduler.service";
import {
  CheckProvider,
  CheckSocialsList,
} from "@packages/shared/dto/socials.dto";

@Controller("/setup")
@IsSuperAdminGuard()
export class SetupController {
  constructor(
    private _modelsService: ModelsService,
    private _socialService: SocialService,
    private _schedulerService: SchedulerService,
  ) {}

  @Get("/")
  async list() {
    return {
      ...(await this._modelsService.getModelsForClient(true)),
      ...(await this._socialService.getSocialsInformation(true)),
    };
  }

  @Post("/social/status/:provider")
  async socialStatus(
    @Param() provider: CheckProvider,
    @Body("privateKey") sk: string,
    @Body("publicKey") pk: string,
  ) {
    return {
      valid: await this._schedulerService.checkKeys(provider.provider, sk, pk),
    };
  }

  @Post("/status/:provider")
  async provider(
    @Param("provider") provider: GenerationIdentifiers,
    @Body("key") key: string,
  ) {
    return {
      valid: await this._modelsService.checkModelApi(provider, key),
    };
  }

  @Post("/socials")
  async saveSocialMedia(@Body() body: CheckSocialsList) {
    const checkSocials = await Promise.all(
      body.socials.map((p) => {
        return this._schedulerService.checkKeys(
          p.identifier,
          p.privateKey,
          p.publicKey,
        );
      }),
    );

    const invalid = checkSocials.indexOf(false);
    if (invalid > -1) {
      throw new HttpException(`Invalid keys for ${body.socials[invalid].identifier}`, 400);
    }

    return this._socialService.saveSocials(body);
  }

  @Post("/generators")
  async saveSettings(
    @GetOrganizationFromRequest() organization: Organization,
    @Body() body: SetupDto,
  ) {
    return this._modelsService.saveSettings(organization.id, body);
  }
}
