import { Injectable } from "@nestjs/common";
import { PrismaRepository } from "@packages/backend/database/prisma/prisma";
import { SetupDto } from "@packages/shared/dto/setup/setup.dto";
import { EncryptionService } from "@packages/backend/encryption/encryption.service";

@Injectable()
export class ModelsRepository {
  constructor(private _models: PrismaRepository<"models">) {}

  async getModels() {
    return this._models.model.models.findMany();
  }

  async saveSettings(organizationId: string, settings: SetupDto) {
    for (const setting of settings.list) {
      await this._models.model.models.upsert({
        where: {
          container: setting.identifier,
        },
        create: {
          models: JSON.stringify(setting.models),
          container: setting.identifier,
          apiKey: EncryptionService.signJWT({ key: setting.apiKey }),
        },
        update: {
          models: JSON.stringify(setting.models),
          apiKey: EncryptionService.signJWT({ key: setting.apiKey }),
        },
      });
    }

    await this._models.model.models.deleteMany({
      where: {
        container: {
          notIn: settings.list.map((p) => p.identifier),
        },
      },
    });
  }

  async getModelsByIdentifier(identifier: string) {
    return this._models.model.models.findFirst({
      where: {
        container: identifier,
      },
    });
  }
}
