import { GenerationIdentifiers } from "@packages/backend/generations/generation.identifiers";
import { GenerationCategory } from "@packages/backend/generations/generation.category";
import { GenerationBaseInterface } from "@packages/backend/generations/generation.base.interface";

async function createFalInstance(apiKey: string) {
  const { fal } = await import("@fal-ai/client");
  fal.config({
    credentials: apiKey,
  });
  return fal;
}

export class FalProvider implements GenerationBaseInterface {
  identifier = GenerationIdentifiers.FAL;
  models = [
    {
      label: "Realistic People",
      model: "fal-ai/flux-pro/v1.1-ultra",
      category: GenerationCategory.NORMAL_IMAGE,
    },
    {
      label: "Generic Image Generation",
      model: "fal-ai/fooocus",
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
  ) {
    const fal = await createFalInstance(apiKey);

    const result = await fal.subscribe(model, {
      input: {
        prompt: text,
        total,
        seed,
      },
    });

    return result.data.images.map((image: any) => image.url);
  }

  async testConnection(apiKey: string): Promise<boolean> {
    try {
      const req = await fetch("https://rest.alpha.fal.ai/tokens/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Key ${apiKey}`,
        },
      });

      return req.status !== 401;
    } catch (err) {
      return false;
    }
  }
}
