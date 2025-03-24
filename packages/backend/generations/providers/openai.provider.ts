import { GenerationIdentifiers } from "@packages/backend/generations/generation.identifiers";
import { GenerationCategory } from "@packages/backend/generations/generation.category";
import { Input } from "@packages/backend/generations/generation.base.interface";
import { GenerationBase } from "@packages/backend/generations/generation.base";
import OpenAI from "openai";
import { ChatOpenAI } from "@langchain/openai";

export class OpenaiProvider extends GenerationBase {
  docsLink = "platform.openai.com/docs";
  identifier = GenerationIdentifiers.OPENAI;
  models = [
    {
      label: "Chatgpt 4o",
      model: "gpt-4o",
      category: GenerationCategory.TEXT,
      mapInput: (input: Input) => ({
        model: input.model,
        messages: [
          {
            role: "user",
            content: input.text,
          },
        ],
      }),
    },
    {
      label: "Chatgpt o1",
      model: "gpt-o1",
      category: GenerationCategory.TEXT,
      mapInput: (input: Input) => ({
        model: input.model,
        messages: [
          {
            role: "user",
            content: input.text,
          },
        ],
      }),
    },
    {
      label: "Chatgpt Dall-3",
      model: "dall-e-3",
      category: GenerationCategory.NORMAL_IMAGE,
      mapInput: (input: Input) => ({
        model: input.model,
        prompt: input.text,
        n: 1,
        size: "1024x1024",
      }),
    },
  ];

  async generateImage(params: Input) {
    const client = new OpenAI({
      apiKey: params.apiKey,
    });

    const generate = await client.images.generate({
      ...this.transformRequest(params.model, params),
    });

    return generate.data.map((p) => p.url);
  }

  async testConnection(apiKey: string): Promise<boolean> {
    try {
      const client = new OpenAI({
        apiKey,
      });

      return !!(await client.models.list());
    } catch (err) {
      return false;
    }
  }

  langchain(input: Required<Pick<Input, "apiKey" | "model">>) {
    return new ChatOpenAI({
      apiKey: input.apiKey,
      model: input.model,
    });
  }
}
