import { Controller, Get, Query, Redirect, Req } from "@nestjs/common";
import { SchedulerService } from "@packages/backend/scheduler/scheduler.service";

@Controller("/redirect")
export class RedirectController {
  constructor(private _schedulerService: SchedulerService) {}

  @Get("/")
  @Redirect("/", 302)
  async getInformation(@Query() query: any) {
    try {
      const auth = await this._schedulerService.authenticate(query, query.provider);
      return {
        url: auth,
      };
    }
    catch (err) {
      console.log(err);
      return {
        url: '/calendar/?err=Could not add channel'
      }
    }
  }
}
