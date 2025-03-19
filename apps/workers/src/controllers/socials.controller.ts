import { Controller } from "@nestjs/common";
import { EventPattern, Transport } from "@nestjs/microservices";
import {SocialService} from "@packages/backend/database/social/social.service";

@Controller()
export class SocialsController {
    constructor(private _socialsService: SocialService) {}

    @EventPattern("post", Transport.REDIS)
    async train(data: { id: string }) {
        // return this._socialsService.post(data.id);
    }
}
