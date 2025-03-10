import { VideoGenerationInterface } from "@packages/shared/generations/video-generation/video-generation.interface";
import { GenerationCategory } from "@packages/shared/generations/generation.category";
import { GenerationIdentifiers } from "@packages/shared/generations/generation.identifiers";

export class RunwaymlProvider implements VideoGenerationInterface {
  identifier = GenerationIdentifiers.RUNWAYML;
  models = [
    {
      label: "Replicate Consistent Character",
      model:
        "fofr/consistent-character:9c77a3c2f884193fcee4d89645f02a0b9def9434f9e03cb98460456b831c8772",
      category: GenerationCategory.VIDEO,
    },
  ];
  async generateVideo(
    apiKey: string,
    model: string,
    image: string,
    text: string,
    total: number,
    seed?: number,
  ): Promise<string> {
    return "";
  }

  async testConnection(apiKey: string): Promise<boolean> {
    const request = await fetch('https://api.dev.runwayml.com/v1/tasks/test', {
      headers: {
        'X-Runway-Version': '2024-11-06',
        'Authorization': `Bearer ${apiKey}`,
      }
    });

    return request.status !== 401;
  }
}
