import { Controller, Delete, Get, Param } from "@nestjs/common";
import { GetOrganizationFromRequest } from "@backend/services/auth/org.from.request";
import { Organization } from "@prisma/client";
import {CharactersService} from "@packages/backend/database/characters/characters.service";

@Controller("/characters")
export class CharactersController {
  constructor(private _charactersService: CharactersService) {}

  @Get("/")
  async list(@GetOrganizationFromRequest() org: Organization) {
    return this._charactersService.getAllCharacters(org.id);
  }

  @Delete("/:id")
  async delete(
    @GetOrganizationFromRequest() org: Organization,
    @Param("id") id: string,
  ) {
    return this._charactersService.deleteCharacter(org.id, id);
  }
}
