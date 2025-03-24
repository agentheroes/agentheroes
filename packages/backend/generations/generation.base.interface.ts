import { GenerationIdentifiers } from "@packages/backend/generations/generation.identifiers";
import { GenerationCategory } from "@packages/backend/generations/generation.category";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";

export interface Input {
  apiKey: string;
  model: string;
  text?: string;
  image?: string;
  total: number;
  seed?: number;
  images?: string[];
  previousImage?: string;
}

export interface Inference {
  apiKey: string;
  model: string;
  prompt: string;
  lora: string;
}

export interface GenerationImageInterface {
  generateImage?(params: Input): Promise<Array<string | Buffer>>;
}

export interface GenerationVideoInterface {
  generateVideo?(params: Input): Promise<Array<string | Buffer>>;
}

// Define model entry type based on category
export type ModelEntry<C extends GenerationCategory> = {
  label: string;
  model: string;
  category: C;
  mapInput?: (input: Input) => any;
  inferenceModel?: string;
  inferenceMapInput?: (input: Inference) => any;
};

export interface GenerationBaseInterface
  extends GenerationImageInterface,
    GenerationVideoInterface {
  langchain?(input: Required<Pick<Input, "apiKey" | "model">>): BaseChatModel;
  identifier: GenerationIdentifiers;
  models: ModelEntry<GenerationCategory>[];
  testConnection(apiKey: string): Promise<boolean>;
  generateLookALikeImages?(params: Input): Promise<Array<string | Buffer>>;
  trainImages?(params: Input): Promise<string>;
  generateInferenceImage?(params: Inference): Promise<string>;
  generateText?(params: Input): Promise<string>;
}
