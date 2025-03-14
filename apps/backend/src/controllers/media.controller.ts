import { Body, Controller, Delete, Get, Param, Post } from "@nestjs/common";
import { GetOrganizationFromRequest } from "@backend/services/auth/org.from.request";
import { Organization } from "@prisma/client";
import {MediaService} from "@packages/backend/database/media/media.service";

@Controller("/media")
export class MediaController {
  constructor(private _mediaService: MediaService) {}

  @Get("/")
  async list(@GetOrganizationFromRequest() org: Organization) {
    return this._mediaService.getAllMedia(org.id);
  }
  
  @Delete("/:id")
  async delete(
    @GetOrganizationFromRequest() org: Organization,
    @Param("id") id: string
  ) {
    return this._mediaService.deleteMedia(org.id, id);
  }
}
