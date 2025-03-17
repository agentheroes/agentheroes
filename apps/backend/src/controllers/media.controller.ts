import { Body, Controller, Delete, Get, Param, Post, UploadedFile, UseInterceptors } from "@nestjs/common";
import { GetOrganizationFromRequest } from "@backend/services/auth/org.from.request";
import { Organization } from "@prisma/client";
import { MediaService } from "@packages/backend/database/media/media.service";
import { FileInterceptor } from "@nestjs/platform-express";
import { UploadService } from "@packages/backend/upload/upload.service";

@Controller("/media")
export class MediaController {
  constructor(
    private _mediaService: MediaService,
    private _uploadService: UploadService
  ) {}

  @Get("/")
  async list(@GetOrganizationFromRequest() org: Organization) {
    return this._mediaService.getAllMedia(org.id);
  }
  
  @Post("/upload")
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @GetOrganizationFromRequest() org: Organization,
    @UploadedFile() file: Express.Multer.File
  ) {
    const uploadResult = await this._uploadService.service.uploadFile(file);

    return {
      url: uploadResult.path
    };
  }
  
  @Delete("/:id")
  async delete(
    @GetOrganizationFromRequest() org: Organization,
    @Param("id") id: string
  ) {
    return this._mediaService.deleteMedia(org.id, id);
  }
}
