import { Injectable } from "@nestjs/common";
import { PrismaRepository } from "@packages/backend/database/prisma/prisma";
import {SetupDto} from "@packages/shared/dto/setup/setup.dto";
import {EncryptionService} from "@packages/backend/encryption/encryption.service";

@Injectable()
export class ModelsRepository {
  constructor(
    private _models: PrismaRepository<"models">,
  ) {}

  async saveSettings(organizationId: string, settings: SetupDto) {
    for (const setting of settings.list) {
      await this._models.model.models.upsert({
        where: {
          organizationId_container: {
            organizationId,
            container: setting.identifier
          }
        },
        create: {
          organizationId,
          models: JSON.stringify(setting.models),
          container: setting.identifier,
          apiKey: EncryptionService.signJWT({key: setting.apiKey}),
        },
        update: {
          models: JSON.stringify(setting.models),
          apiKey: EncryptionService.signJWT({key: setting.apiKey}),
        }
      });
    }
  }
}
