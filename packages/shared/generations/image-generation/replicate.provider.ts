import { ImageGeneration } from "@packages/shared/generations/image-generation/image-generation.interface";
import { GenerationIdentifiers } from "@packages/shared/generations/generation.identifiers";
import { GenerationCategory } from "@packages/shared/generations/generation.category";

export class ReplicateProvider implements ImageGeneration {
  identifier = GenerationIdentifiers.REPLICATE;
  models = [
    {
      label: "Replicate Consistent Character",
      model:
        "fofr/consistent-character:9c77a3c2f884193fcee4d89645f02a0b9def9434f9e03cb98460456b831c8772",
      category: GenerationCategory.LOOK_A_LIKE_IMAGE,
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
