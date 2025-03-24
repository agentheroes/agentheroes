import { GenerationCategory } from "@packages/backend/generations/generation.category";
import {
  IsArray, IsBoolean,
  IsDefined,
  IsIn,
  IsNumber, IsOptional,
  IsString,
  IsUrl,
  MinLength,
  ValidateIf,
} from "class-validator";

export class GenerateModelDto {
  @IsIn(Object.values(GenerationCategory))
  type: GenerationCategory;

  @IsString()
  @MinLength(3)
  @ValidateIf(
    (o) =>
      o.type === GenerationCategory.NORMAL_IMAGE ||
      o.type === GenerationCategory.VIDEO ||
      o.type === GenerationCategory.LOOK_A_LIKE_IMAGE,
  )
  prompt: string;

  @IsString()
  @IsDefined()
  model: string;

  @IsOptional()
  @IsBoolean()
  saveAsMedia: boolean;

  @IsString({ each: true })
  @IsArray()
  @IsDefined()
  @ValidateIf((o) => o.type === GenerationCategory.TRAINER)
  images: string[];

  @IsUrl()
  @ValidateIf((o) => o.type === GenerationCategory.TRAINER)
  baseImage: string;

  @IsString()
  @ValidateIf((o) => o.type === GenerationCategory.TRAINER)
  name: string;

  @IsUrl()
  @ValidateIf((o) => o.type === GenerationCategory.LOOK_A_LIKE_IMAGE)
  image: string;

  @IsNumber()
  @IsDefined()
  @ValidateIf((o) => o.type === GenerationCategory.LOOK_A_LIKE_IMAGE)
  amount: number;
}
