import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from "@nestjs/common";
import { SchedulerService } from "@packages/backend/scheduler/scheduler.service";
import { GetOrganizationFromRequest } from "@backend/services/auth/org.from.request";
import { Organization } from "@prisma/client";
import { SocialLinkDTO } from "@packages/shared/dto/socials.dto";
import { SocialService } from "@packages/backend/database/social/social.service";
import { CalendarPosts } from "@packages/shared/dto/socials/calendar.posts.dto";
import { PostCreateDto } from "@packages/shared/dto/socials/post.create.dto";

@Controller("/socials")
export class SocialController {
  constructor(
    private _schedulerService: SchedulerService,
    private _socialService: SocialService,
  ) {}

  @Get("/url")
  async url(
    @GetOrganizationFromRequest() org: Organization,
    @Query() query: SocialLinkDTO,
  ) {
    return {
      url: await this._schedulerService.generateURL(
        org.id,
        process.env.WEBSITE_URL || query.referer,
        query.identifier,
        query.timezone,
        query.rootInternalId,
        query.internalId,
      ),
    };
  }

  @Get("/available")
  async available() {
    return this._socialService.getSocialsInformation(false);
  }

  @Get("/")
  async list(@GetOrganizationFromRequest() org: Organization) {
    return this._socialService.getOrganizationsSocials(org.id);
  }

  @Get("/calendar")
  async calendar(
    @GetOrganizationFromRequest() organization: Organization,
    @Query() body: CalendarPosts,
  ) {
    return this._socialService.getOrganizationsPosts(organization.id, body);
  }

  @Get("/calendar/:group")
  async calendarGroup(
    @GetOrganizationFromRequest() organization: Organization,
    @Param("group") group: string,
  ) {
    return this._socialService.getAllPostsPerGroup(organization.id, group);
  }

  @Put("/calendar/move/:group")
  async changeDate(
    @GetOrganizationFromRequest() organization: Organization,
    @Param("group") group: string,
    @Body() body: { date: string },
  ) {
    return this._socialService.changePostDate(
      organization.id,
      group,
      body.date,
    );
  }

  @Delete("/calendar/:group")
  async deletePostsByGroup(
    @GetOrganizationFromRequest() organization: Organization,
    @Param("group") group: string,
  ) {
    return this._socialService.deletePostsByGroup(organization.id, group);
  }

  @Post("/posts")
  savePosts(
    @GetOrganizationFromRequest() org: Organization,
    @Body() posts: PostCreateDto,
  ) {
    return this._socialService.savePost(org.id, posts);
  }
}
