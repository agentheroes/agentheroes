import { GenerationBaseInterface } from "@packages/shared/generations/generation.base.interface";

export interface ImageGeneration extends GenerationBaseInterface {
  generateImage(
    apiKey: string,
    model: string,
    text: string,
    total: number,
    seed?: number,
    previousImage?: string,
  ): Promise<string>;
}
