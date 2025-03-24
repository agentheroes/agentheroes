import { GenerationIdentifiers } from "@packages/backend/generations/generation.identifiers";
import { GenerationCategory } from "@packages/backend/generations/generation.category";
import {
  Inference,
  Input,
} from "@packages/backend/generations/generation.base.interface";
import { GenerationBase } from "@packages/backend/generations/generation.base";

async function createFalInstance(apiKey: string) {
  const { fal } = await import("@fal-ai/client");
  fal.config({
    credentials: apiKey,
  });
  return fal;
}

export class FalProvider extends GenerationBase {
  docsLink = 'docs.fal.ai';
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
    {
      label: "Veo2",
      model: "fal-ai/veo2/image-to-video",
      category: GenerationCategory.VIDEO,
      mapInput: (input: Input) => ({
        prompt: input.text,
        image_url: input.image,
      }),
    },
    {
      label: "Quick Trainer",
      model: "fal-ai/flux-lora-fast-training",
      category: GenerationCategory.TRAINER,
      mapInput: (input: Input) => ({
        images_data_url: input.image,
        trigger_word: "CHARACTER",
        steps: 1000,
        data_archive_format: "zip",
      }),
      inferenceModel: "fal-ai/flux-lora",
      inferenceMapInput: (input: Inference) => ({
        prompt: "CHARACTER " + input.prompt,
        loras: [
          {
            path: input.lora,
            scale: 1,
          },
        ],
        input: 1,
        enable_safety_checker: false,
        output_format: "png",
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

  async generateVideo(params: Input) {
    const fal = await createFalInstance(params.apiKey);

    const result = await fal.subscribe(params.model, {
      input: {
        ...this.transformRequest(params.model, params),
      },
    });

    return [result.data.video.url];
  }

  async generateInferenceImage(params: Inference) {
    const fal = await createFalInstance(params.apiKey);

    const result = await fal.subscribe(params.model, {
      input: {
        ...this.transformInferenceRequest(params.model, params),
      },
    });

    return result.data.images.map((image: any) => image.url);
  }

  async trainImages(params: Input) {
    const fal = await createFalInstance(params.apiKey);
    const zipFile = await this.imagesToZip(params.images!);
    const result = await fal.subscribe(params.model, {
      input: {
        ...this.transformRequest(params.model, {
          image: zipFile,
          total: 1,
          model: params.model,
          apiKey: params.apiKey,
        }),
      },
    });

    return result.data.diffusers_lora_file.url;
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
