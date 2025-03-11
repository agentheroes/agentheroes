import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "@backend/app.module";
import { ValidationPipe } from "@nestjs/common";
import cookieParser from "cookie-parser";
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  app.use(cookieParser());

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
