import {
  GenerationBaseInterface,
  Input,
} from "@packages/backend/generations/generation.base.interface";
import { GenerationIdentifiers } from "@packages/backend/generations/generation.identifiers";
import { GenerationCategory } from "@packages/backend/generations/generation.category";

export abstract class GenerationBase implements GenerationBaseInterface {
  abstract identifier: GenerationIdentifiers;
  abstract models: {
    label: string;
    model: string;
    category: GenerationCategory;
    mapInput?: (input: Input) => any;
  }[];
  abstract testConnection(apiKey: string): Promise<boolean>;
  transformRequest(model: string, input: Input) {
      return this.models.find(p => p.model === model)?.mapInput?.(input) || input;
  }
}
