import {IsArray, IsDefined, IsIn, IsString, ValidateNested} from "class-validator";
import {Type} from "class-transformer";
import {GenerationIdentifiers} from "@packages/backend/generations/generation.identifiers";

export class SetupProviderDto {
    @IsIn(Object.values(GenerationIdentifiers))
    @IsDefined()
    identifier: GenerationIdentifiers;

    @IsString()
    apiKey: string;

    @IsDefined()
    @IsArray()
    @IsString({each: true})
    models: string[];
}

export class SetupDto {
    @IsDefined()
    @IsArray()
    @ValidateNested({each: true})
    @Type(() => SetupProviderDto)
    list: SetupProviderDto[];
}