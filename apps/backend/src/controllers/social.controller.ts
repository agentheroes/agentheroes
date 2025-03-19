import {Body, Controller, Get, Param, Post, Query} from "@nestjs/common";
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
        query.referer,
        query.identifier,
        query.timezone,
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
      @Param('id') id: string
  ) {
    return this._socialService.getAllPostsPerGroup(organization.id, id);
  }

  @Post("/posts")
  savePosts(
    @GetOrganizationFromRequest() org: Organization,
    @Body() posts: PostCreateDto,
  ) {
    return this._socialService.savePost(org.id, posts);
  }
}
