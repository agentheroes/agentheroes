import { Module } from "@nestjs/common";
import { BullMqModule } from "@packages/backend/bull-mq-transport-new/bull.mq.module";
import { ModelsController } from "@workers/controllers/models.controller";
import { ConfigModuleImport } from "@packages/backend/dotenv/config.module";
import { DatabaseModule } from "@packages/backend/database/database.module";
import { SharedServices } from "@packages/backend/shared.services";

@Module({
  imports: [ConfigModuleImport, DatabaseModule, SharedServices, BullMqModule],
  controllers: [ModelsController],
  providers: [],
})
export class AppModule {}
