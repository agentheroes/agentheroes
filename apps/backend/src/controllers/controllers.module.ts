import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { UsersController } from "@backend/controllers/users.controller";
import { AuthController } from "@backend/controllers/auth.controller";
import { AuthMiddleware } from "@backend/services/auth/auth.middleware";
import { SetupController } from "@backend/controllers/setup.controller";
import { ModelsController } from "@backend/controllers/models.controller";
import { CharactersController } from "@backend/controllers/characters.controller";
import { MediaController } from "@backend/controllers/media.controller";
import { SocialController } from "@backend/controllers/social.controller";
import { RedirectController } from "@backend/controllers/redirect.controller";
import { AgentController } from "@backend/controllers/agent.controller";
import { TriggerController } from "@backend/controllers/trigger.controller";

const authControllers = [
  UsersController,
  SetupController,
  ModelsController,
  CharactersController,
  MediaController,
  SocialController,
  AgentController,
];

@Module({
  imports: [],
  controllers: [
    AuthController,
    RedirectController,
    TriggerController,
    ...authControllers,
  ],
  providers: [],
  exports: [],
})
export class ControllersModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(...authControllers);
  }
}
