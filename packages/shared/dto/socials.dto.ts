import {
  IsArray,
  IsDefined,
  IsIn,
  IsNumberString, IsOptional,
  IsString,
  IsUrl, ValidateIf,
  ValidateNested,
} from "class-validator";
import { SchedulerList } from "@packages/backend/scheduler/scheduler.list";
import { Type } from "class-transformer";

export class SocialLinkDTO {
  @IsString()
  @IsDefined()
  identifier: string;

  @IsIn(['true'])
  @IsOptional()
  refresh: string;

  @IsString()
  @ValidateIf(p => p.refresh === "true")
  rootInternalId: string;

  @IsString()
  @ValidateIf(p => p.refresh === "true")
  internalId: string;

  @IsUrl({
    require_tld: false,
  })
  @IsDefined()
  referer: string;

  @IsDefined()
  @IsNumberString()
  timezone: number;
}

export class CheckProvider {
  @IsIn(SchedulerList.map((p) => p.identifier))
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
  @ValidateNested({ each: true })
  @Type(() => CheckSocials)
  socials: CheckSocials[];
}
