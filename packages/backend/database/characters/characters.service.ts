import { Injectable } from "@nestjs/common";
import { GenerateModelDto } from "@packages/shared/dto/models/generate.model.dto";
import { Status } from "@prisma/client";
import { CharactersRepository } from "@packages/backend/database/characters/characters.repository";

@Injectable()
export class CharactersService {
  constructor(private _charactersRepository: CharactersRepository) {}

  async sendForTraining(orgId: string, model: GenerateModelDto) {
    return this._charactersRepository.createTraining(orgId, model);
  }

  async getCharacterById(id: string) {
    return this._charactersRepository.getCharacterById(id);
  }

  async updateLora(id: string, lora: string, status: Status) {
    return this._charactersRepository.updateLora(id, lora, status);
  }

  async getAllCharacters(orgId: string) {
    return this._charactersRepository.getAllCharacters(orgId);
  }

  async deleteCharacter(orgId: string, id: string) {
    return this._charactersRepository.deleteCharacter(orgId, id);
  }
}
