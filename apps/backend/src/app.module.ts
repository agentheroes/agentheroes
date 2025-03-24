import { Global, Module } from "@nestjs/common";
import { ConfigModuleImport } from "@packages/backend/dotenv/config.module";
import { BullMqModule } from "@packages/backend/bull-mq-transport-new/bull.mq.module";
import { AuthService } from "@backend/services/auth/auth.service";
import { DatabaseModule } from "@packages/backend/database/database.module";
import { SharedServices } from "@packages/backend/shared.services";
import { ControllersModule } from "@backend/controllers/controllers.module";
import { IsSuperAdmin } from "@backend/services/auth/is.super.admin";
import { ServeStaticModule } from '@nestjs/serve-static';

@Global()
@Module({
  imports: [
    ControllersModule,
    ConfigModuleImport,
    BullMqModule,
    DatabaseModule,
    SharedServices,
    ...(process.env.STORAGE_PROVIDER === "local"
      ? [
          ServeStaticModule.forRoot({
            rootPath: process.env.UPLOAD_DIRECTORY,
            serveRoot: '/uploads/'
          }),
        ]
      : []),
  ],
  controllers: [],
  providers: [AuthService, IsSuperAdmin],
  get exports() {
    return [...this.providers, ...this.imports];
  },
})
export class AppModule {}
