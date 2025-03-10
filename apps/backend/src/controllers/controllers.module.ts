import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { UsersController } from "@backend/controllers/users.controller";
import { AuthController } from "@backend/controllers/auth.controller";
import { AuthMiddleware } from "@backend/services/auth/auth.middleware";
import {SetupController} from "@backend/controllers/setup.controller";

const authControllers = [UsersController, SetupController];

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
