import { Injectable } from "@nestjs/common";
import { PrismaRepository } from "@packages/backend/database/prisma/prisma";
import { GenerateModelDto } from "@packages/shared/dto/models/generate.model.dto";
import { Status } from "@prisma/client";

@Injectable()
export class CharactersRepository {
  constructor(private _characters: PrismaRepository<"characters">) {}

  createTraining(orgId: string, model: GenerateModelDto) {
    return this._characters.model.characters.create({
      data: {
        name: model.name,
        images: JSON.stringify(model.images || "[]"),
        models: model.model,
        avatar: model.baseImage,
        organizationId: orgId,
        status: "IN_PROGRESS",
      },
    });
  }

  async getCharacterById(id: string) {
    return this._characters.model.characters.findUnique({
      where: {
        id,
      },
    });
  }

  async updateLora(id: string, lora: string, status: Status) {
    return this._characters.model.characters.update({
      where: {
        id,
      },
      data: {
        ...(lora ? { lora } : {}),
        status,
      },
    });
  }

  getAllCharacters(orgId: string) {
    return this._characters.model.characters.findMany({
      where: {
        organizationId: orgId,
        deletedAt: null,
      },
    });
  }

  deleteCharacter(orgId: string, id: string) {
    return this._characters.model.characters.update({
      where: {
        organizationId: orgId,
        id,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
