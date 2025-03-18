import { Controller, Get, Query } from "@nestjs/common";
import { SchedulerService } from "@packages/backend/scheduler/scheduler.service";
import { GetOrganizationFromRequest } from "@backend/services/auth/org.from.request";
import { Organization } from "@prisma/client";
import { SocialLinkDTO } from "@packages/shared/dto/socials.dto";

@Controller("/socials")
export class SocialController {
  constructor(private _schedulerService: SchedulerService) {}

  @Get("/")
  async url(
    @GetOrganizationFromRequest() org: Organization,
    @Query() query: SocialLinkDTO,
  ) {
    return {
      url: await this._schedulerService.generateURL(
        org.id,
        query.referer,
        query.identifier,
      ),
    };
  }
}
