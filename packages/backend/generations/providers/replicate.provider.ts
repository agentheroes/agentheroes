import { GenerationIdentifiers } from "@packages/backend/generations/generation.identifiers";
import { GenerationCategory } from "@packages/backend/generations/generation.category";
import Replicate from "replicate";
import { Input } from "@packages/backend/generations/generation.base.interface";
import { GenerationBase } from "@packages/backend/generations/generation.base";

export class ReplicateProvider extends GenerationBase {
  docsLink = 'docs.runwayml.com';
  identifier = GenerationIdentifiers.REPLICATE;
  models = [
    {
      label: "Replicate Consistent Character",
      model:
        "fofr/consistent-character:9c77a3c2f884193fcee4d89645f02a0b9def9434f9e03cb98460456b831c8772",
      category: GenerationCategory.LOOK_A_LIKE_IMAGE,
      mapInput: (params: Input) => {
        return {
          prompt: params.text,
          subject: params.image,
          output_format: "webp",
          output_quality: 80,
          negative_prompt: "",
          randomise_poses: true,
          number_of_outputs: 1,
          number_of_images_per_pose: 1,
        };
      },
    },
  ];

  async generateImage(params: Input) {
    const replicate = new Replicate({
      auth: params.apiKey,
    });

    // @ts-ignore
    const [output] = await replicate.run(
      params.model as `${string}/${string}` | `${string}/${string}:${string}`,
      {
        input: {
          ...this.transformRequest(params.model, params),
        },
      },
    );

    return output;
  }

  async generateLookALikeImages(params: Input) {
    const replicate = new Replicate({
      auth: params.apiKey,
      useFileOutput: false,
    });

    const load = await replicate.run(
      params.model as `${string}/${string}` | `${string}/${string}:${string}`,
      {
        input: {
          ...this.transformRequest(params.model, params),
        },
      },
    );

    return load as any;
  }

  async testConnection(apiKey: string): Promise<boolean> {
    try {
      const account = await (
        await fetch("https://api.replicate.com/v1/account", {
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        })
      ).json();

      return !!account.username;
    } catch (err) {}
  }
}
