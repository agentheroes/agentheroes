import { Module } from "@nestjs/common";
import {BullMqModule} from "@packages/backend/bull-mq-transport-new/bull.mq.module";

@Module({
  imports: [BullMqModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
