import {IsDefined, IsIn, IsString, IsUrl} from "class-validator";
import {SchedulerList} from "@packages/backend/scheduler/scheduler.list";

export class SocialLinkDTO {
    @IsString()
    @IsDefined()
    identifier: string;

    @IsUrl()
    @IsDefined()
    referer: string;
}

export class CheckProvider {
    @IsIn(SchedulerList.map(p => p.identifier))
    @IsDefined()
    provider: string;
}