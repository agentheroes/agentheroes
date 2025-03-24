import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class Data {
  @IsString()
  @IsNotEmpty()
  nodeIdentifier: string;

  @IsString()
  @IsOptional()
  interval: string;

  @IsString()
  @IsOptional()
  url?: string;

  @IsString()
  @IsOptional()
  prompt?: string;

  @IsString()
  @IsOptional()
  character?: string;

  @IsString()
  @IsOptional()
  model?: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsString()
  @IsOptional()
  text?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  selectedChannels?: string[];

  @IsString()
  @IsOptional()
  media?: string;
}

export class Node {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @ValidateNested()
  @Type(() => Data)
  data: Data;

  @IsString()
  @IsNotEmpty()
  renderedText: string;

  @IsBoolean()
  isValid: boolean;

  @IsString()
  @IsOptional()
  parent?: string;
}

export class CreateAgentDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  textModel: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Node)
  nodes: Node[];
}
