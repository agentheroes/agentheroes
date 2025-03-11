import { GenerationCategory } from "@packages/backend/generations/generation.category";
import { GenerationIdentifiers } from "@packages/backend/generations/generation.identifiers";
import { GenerationBaseInterface } from "@packages/backend/generations/generation.base.interface";
import RunwayML from "@runwayml/sdk";

export class RunwaymlProvider implements GenerationBaseInterface {
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
  ) {
    const client = new RunwayML({
      apiKey,
    });

    const imageToVideo = await client.imageToVideo.create({
      model: model as "gen3a_turbo",
      // Point this at your own image file
      promptImage: image,
      promptText: text,
      seed,
      duration: 5,
      watermark: false,
    });

    const taskId = imageToVideo.id;

    // Poll the task until it's complete
    let task: Awaited<ReturnType<typeof client.tasks.retrieve>>;
    do {
      // Wait for ten seconds before polling
      await new Promise((resolve) => setTimeout(resolve, 10000));

      task = await client.tasks.retrieve(taskId);
    } while (!["SUCCEEDED", "FAILED"].includes(task.status));

    if (task.status === 'FAILED') {
      throw 'Can not generate';
    }

    return task.output;
  }

  async testConnection(apiKey: string): Promise<boolean> {
    const request = await fetch("https://api.dev.runwayml.com/v1/tasks/test", {
      headers: {
        "X-Runway-Version": "2024-11-06",
        Authorization: `Bearer ${apiKey}`,
      },
    });

    return request.status !== 401;
  }
}
