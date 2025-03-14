import {IsIn, IsString, MinLength, ValidateIf} from "class-validator";

export class GenerateCharacterDto {
  @IsIn(["image", "video"])
  type: "image" | "video";

  @ValidateIf(o => o.type === "video")
  @IsString()
  videoModel: string;

  @IsString()
  @MinLength(3)
  prompt: string;
}
