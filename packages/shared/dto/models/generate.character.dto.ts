import { Type } from "@prisma/client";
import { IsIn, IsString, MinLength, ValidateIf } from "class-validator";

export class GenerateCharacterDto {
  @IsIn(Object.values(Type))
  type: Type;

  @ValidateIf((o) => o.type === "video")
  @IsString()
  videoModel: string;

  @ValidateIf((o) => o.type === "video")
  @IsString()
  image: string;

  @IsString()
  @MinLength(3)
  prompt: string;
}
