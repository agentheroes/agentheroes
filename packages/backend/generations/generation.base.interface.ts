import { GenerationIdentifiers } from "@packages/backend/generations/generation.identifiers";
import { GenerationCategory } from "@packages/backend/generations/generation.category";

export interface Input {
  apiKey: string;
  model: string;
  text: string;
  image?: string;
  total: number;
  seed?: number;
  previousImage?: string;
}
export interface GenerationImageInterface {
  generateImage?(params: Input): Promise<Array<string | Buffer>>;
}

export interface GenerationVideoInterface {
  generateVideo?(params: Input): Promise<Array<string | Buffer>>;
}

export interface GenerationBaseInterface
  extends GenerationImageInterface,
    GenerationVideoInterface {
  identifier: GenerationIdentifiers;
  models: {
    label: string;
    model: string;
    category: GenerationCategory;
    mapInput?: (input: Input) => any;
  }[];
  testConnection(apiKey: string): Promise<boolean>;
  generateLookALikeImages?(params: Input): Promise<Array<string | Buffer>>;
  trainImages?(params: Input): Promise<string>;
}
