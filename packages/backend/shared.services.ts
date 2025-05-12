import { Global, Module } from "@nestjs/common";
import { EmailService } from "@packages/backend/email/email.service";
import { GenerationService } from "@packages/backend/generations/generation.service";
import { UploadService } from "@packages/backend/upload/upload.service";
import { SchedulerService } from "@packages/backend/scheduler/scheduler.service";
import { AgentProcessService } from "@packages/backend/agents/agent.process.service";
import { AgentModule } from "@packages/backend/agents/agent.module";
import {Nowpayments} from "@packages/backend/payments/nowpayments.service";

@Global()
@Module({
  imports: [AgentModule],
  controllers: [],
  providers: [
    EmailService,
    GenerationService,
    UploadService,
    SchedulerService,
    AgentProcessService,
    Nowpayments,
  ],
  get exports() {
    return [...this.providers, ...this.imports];
  },
})
export class SharedServices {}
