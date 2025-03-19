import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

export class PostItemDto {
  @IsString()
  @IsOptional()
  id: string;

  @IsNumber()
  @IsPositive()
  order: number;

  @IsString()
  @IsNotEmpty()
  text: string;

  @IsArray()
  @IsString({ each: true })
  media: string[];
}

export class PostListItemDto {
  @IsString()
  @IsNotEmpty()
  channel: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PostItemDto)
  posts: PostItemDto[];
}

export class PostCreateDto {
  @IsDateString()
  @IsNotEmpty()
  date: string; // ISO date in YYYY-MM-DD format

  @IsString()
  @IsOptional()
  group: string;

  @IsEnum(["schedule", "draft", "now"])
  @IsNotEmpty()
  type: "schedule" | "draft" | "now";

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PostListItemDto)
  list: PostListItemDto[];
}
