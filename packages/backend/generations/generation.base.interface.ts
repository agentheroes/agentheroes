import { GenerationIdentifiers } from "@packages/backend/generations/generation.identifiers";
import { GenerationCategory } from "@packages/backend/generations/generation.category";

export interface GenerationImageInterface {
  generateImage?(
    apiKey: string,
    model: string,
    text: string,
    total: number,
    seed?: number,
    previousImage?: string,
  ): Promise<Array<string | Buffer>>;
}

export interface GenerationVideoInterface {
  generateVideo?(
    apiKey: string,
    model: string,
    image: string,
    text: string,
    total: number,
    seed?: number,
  ): Promise<Array<string | Buffer>>;
}

export interface GenerationBaseInterface
  extends GenerationImageInterface,
    GenerationVideoInterface {
  identifier: GenerationIdentifiers;
  models: { label: string; model: string; category: GenerationCategory }[];
  testConnection(apiKey: string): Promise<boolean>;
  generateLookALikeImages?(
    apiKey: string,
    model: string,
    text: string,
    total: number,
    seed?: number,
    previousImage?: string,
  ): Promise<string | Buffer>;
  trainImages?(
    apiKey: string,
    model: string,
    images: string[],
    text?: string,
  ): Promise<string>;
}
