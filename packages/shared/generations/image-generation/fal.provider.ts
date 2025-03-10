import { ImageGeneration } from "@packages/shared/generations/image-generation/image-generation.interface";
import { GenerationIdentifiers } from "@packages/shared/generations/generation.identifiers";
import { GenerationCategory } from "@packages/shared/generations/generation.category";
import { fal } from "@fal-ai/client";

export class FalProvider implements ImageGeneration {
  identifier = GenerationIdentifiers.FAL;
  models = [
    {
      label: "Fal Consistent Character",
      model:
        "fofr/consiastent-character:9c77a3c2f884193fcee4d89645f02a0b9def9434f9e03cb98460456b831c8772",
      category: GenerationCategory.NORMAL_IMAGE,
    },
  ];
  async generateImage(
    apiKey: string,
    model: string,
    text: string,
    total: number,
    seed?: number,
    previousImage?: string,
  ): Promise<string> {
    return "";
  }

  async testConnection(apiKey: string): Promise<boolean> {
    try {
      const req = await fetch('https://rest.alpha.fal.ai/tokens/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Key ${apiKey}`
        },
      });

      return req.status !== 401;
    } catch (err) {
      return false;
    }
  }
}
