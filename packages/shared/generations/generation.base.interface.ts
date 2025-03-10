import { GenerationIdentifiers } from "@packages/shared/generations/generation.identifiers";
import { GenerationCategory } from "@packages/shared/generations/generation.category";

export interface GenerationBaseInterface {
  identifier: GenerationIdentifiers;
  models: { label: string; model: string; category: GenerationCategory }[];
  testConnection(apiKey: string): Promise<boolean>;
}
