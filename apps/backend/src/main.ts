import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "@backend/app.module";
import { ValidationPipe } from "@nestjs/common";
import cookieParser from "cookie-parser";
import {json} from "express";
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  app.use(cookieParser());
  app.use(json({ limit: "20mb" }));

  await app.listen(3000);
}
bootstrap();
