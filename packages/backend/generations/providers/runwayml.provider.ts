import { GenerationCategory } from "@packages/backend/generations/generation.category";
import { GenerationIdentifiers } from "@packages/backend/generations/generation.identifiers";
import { Input } from "@packages/backend/generations/generation.base.interface";
import RunwayML from "@runwayml/sdk";
import { GenerationBase } from "@packages/backend/generations/generation.base";

export class RunwaymlProvider extends GenerationBase {
  docsLink = 'replicate.com/docs';
  identifier = GenerationIdentifiers.RUNWAYML;
  models = [
    {
      label: "Gen3a Turbo",
      model:
        "gen3a_turbo",
      category: GenerationCategory.VIDEO,
      mapInput: (input: Input) => ({
        model: input.model as any,
        // Point this at your own image file
        promptImage: input.image,
        promptText: input.text,
        seed: input.seed,
        duration: 5,
        watermark: false,
      }),
    },
  ];

  async generateVideo(params: Input) {
    const client = new RunwayML({
      apiKey: params.apiKey,
    });

    const imageToVideo = await client.imageToVideo.create({
      ...this.transformRequest(params.model, params),
    });

    const taskId = imageToVideo.id;

    // Poll the task until it's complete
    let task: Awaited<ReturnType<typeof client.tasks.retrieve>>;
    do {
      // Wait for ten seconds before polling
      await new Promise((resolve) => setTimeout(resolve, 10000));

      task = await client.tasks.retrieve(taskId);
    } while (!["SUCCEEDED", "FAILED"].includes(task.status));

    if (task.status === "FAILED") {
      throw "Can not generate";
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
