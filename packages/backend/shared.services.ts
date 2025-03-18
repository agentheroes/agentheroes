import { Global, Module } from "@nestjs/common";
import {EmailService} from "@packages/backend/email/email.service";
import {GenerationService} from "@packages/backend/generations/generation.service";
import {UploadService} from "@packages/backend/upload/upload.service";
import {SchedulerService} from "@packages/backend/scheduler/scheduler.service";

@Global()
@Module({
    imports: [],
    controllers: [],
    providers: [
        EmailService,
        GenerationService,
        UploadService,
        SchedulerService,
    ],
    get exports() {
        return [...this.providers];
    },
})
export class SharedServices {}
