import { GenerationBaseInterface } from "@packages/shared/generations/generation.base.interface";

export interface VideoGenerationInterface extends GenerationBaseInterface {
  generateVideo(
    apiKey: string,
    model: string,
    image: string,
    text: string,
    total: number,
    seed?: number,
  ): Promise<string>;
}
