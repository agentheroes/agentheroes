import {IsArray, IsDefined, IsIn, IsString, IsUrl, ValidateNested} from "class-validator";
import {SchedulerList} from "@packages/backend/scheduler/scheduler.list";
import {Type} from "class-transformer";

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

export class CheckSocials {
    @IsString()
    @IsDefined()
    identifier: string;

    @IsString()
    @IsDefined()
    privateKey: string;

    @IsString()
    @IsDefined()
    publicKey: string;
}

export class CheckSocialsList {
    @IsArray()
    @ValidateNested({each: true})
    @Type(() => CheckSocials)
    socials: CheckSocials[]
}