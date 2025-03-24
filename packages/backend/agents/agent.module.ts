import { Global, Module } from "@nestjs/common";
import {GenerateCharacterAgent} from "@packages/backend/agents/providers/generate-image/generate.character.agent";
import {GenerateImageAgent} from "@packages/backend/agents/providers/generate-image/generate.image.agent";
import {GenerateVideoAgent} from "@packages/backend/agents/providers/generate-video/generate.video.agent";
import {SocialMediaAgent} from "@packages/backend/agents/providers/publish/social.media.agent";
import {RssAgent} from "@packages/backend/agents/providers/third-party/rss.agent";
import {ApiAgent} from "@packages/backend/agents/providers/trigger/api.agent";
import {ScheduleAgent} from "@packages/backend/agents/providers/trigger/schedule.agent";
import {DispatchWorkflow} from "@packages/backend/agents/agent.workflow.builder";

@Global()
@Module({
    imports: [],
    controllers: [],
    providers: [
        DispatchWorkflow,
        GenerateCharacterAgent,
        GenerateImageAgent,
        GenerateVideoAgent,
        SocialMediaAgent,
        RssAgent,
        ApiAgent,
        ScheduleAgent,
    ],
    get exports() {
        return [...this.providers];
    },
})
export class AgentModule {}
