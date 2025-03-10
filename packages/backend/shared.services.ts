import { Global, Module } from "@nestjs/common";
import {EmailService} from "@packages/backend/email/email.service";

@Global()
@Module({
    imports: [],
    controllers: [],
    providers: [
        EmailService
    ],
    get exports() {
        return [...this.providers];
    },
})
export class SharedServices {}
