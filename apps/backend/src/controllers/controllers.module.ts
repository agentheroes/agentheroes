import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { UsersController } from "@backend/controllers/users.controller";
import { AuthController } from "@backend/controllers/auth.controller";
import { AuthMiddleware } from "@backend/services/auth/auth.middleware";
import { SetupController } from "@backend/controllers/setup.controller";
import { ModelsController } from "@backend/controllers/models.controller";
import { CharactersController } from "@backend/controllers/characters.controller";

const authControllers = [
  UsersController,
  SetupController,
  ModelsController,
  CharactersController,
];

@Module({
  imports: [],
  controllers: [AuthController, ...authControllers],
  providers: [],
  exports: [],
})
export class ControllersModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(...authControllers);
  }
}
