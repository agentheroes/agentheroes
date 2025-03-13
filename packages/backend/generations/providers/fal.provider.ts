import { GenerationIdentifiers } from "@packages/backend/generations/generation.identifiers";
import { GenerationCategory } from "@packages/backend/generations/generation.category";
import { Input } from "@packages/backend/generations/generation.base.interface";
import { GenerationBase } from "@packages/backend/generations/generation.base";

async function createFalInstance(apiKey: string) {
  const { fal } = await import("@fal-ai/client");
  fal.config({
    credentials: apiKey,
  });
  return fal;
}

export class FalProvider extends GenerationBase {
  identifier = GenerationIdentifiers.FAL;
  models = [
    {
      label: "Realistic People",
      model: "fal-ai/flux-pro/v1.1-ultra",
      category: GenerationCategory.NORMAL_IMAGE,
      mapInput: (input: Input) => ({
        prompt: input.text,
        total: input.total,
        seed: input.seed,
      }),
    },
    {
      label: "Generic Image Generation",
      model: "fal-ai/fooocus",
      category: GenerationCategory.NORMAL_IMAGE,
      mapInput: (input: Input) => ({
        prompt: input.text,
        total: input.total,
        seed: input.seed,
      }),
    },
  ];
  async generateImage(params: Input) {
    const fal = await createFalInstance(params.apiKey);

    const result = await fal.subscribe(params.model, {
      input: {
        ...this.transformRequest(params.model, params),
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
