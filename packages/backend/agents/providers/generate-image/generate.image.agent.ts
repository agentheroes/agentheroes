"use client";

import { Agent, State } from "@packages/backend/agents/agent.workflow.builder";
import { NodeType } from "@packages/shared/agents/agent.flow";
import { Injectable } from "@nestjs/common";
import { enhancePrompt } from "@packages/backend/generations/util/enhance.prompt";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { ModelsService } from "@packages/backend/database/models/models.service";
import { GenerationCategory } from "@packages/backend/generations/generation.category";
import { Type } from "@prisma/client";
import { MediaService } from "@packages/backend/database/media/media.service";

@Injectable()
export class GenerateImageAgent
  implements Agent<{ prompt?: string; model: string }>
{
  constructor(
    private _modelsService: ModelsService,
    private _mediaService: MediaService,
  ) {}

  type = NodeType.GENERATE_IMAGE;
  node = "generate-image";
  async process(
    data: { prompt: string; model: string },
    state: State,
    organization: string,
    model: BaseChatModel,
  ) {
    const newPrompt = await enhancePrompt(
      (state.prompt || "") + "\n\n" + (data.prompt || ""),
      model,
    );

    const url = await this._modelsService.generateImage({
      model: data.model,
      prompt: newPrompt.prompt,
      saveAsMedia: true,
      images: [],
      type: GenerationCategory.NORMAL_IMAGE,
      amount: 1,
      image: "",
      baseImage: "",
      name: newPrompt.fileName,
    });

    const {media} = await this._mediaService.saveMedia(
      "",
      organization,
      newPrompt.prompt,
      Type.IMAGE,
      url[0] as string,
    );

    return { image_url: media as string, image_prompt: newPrompt.prompt };
  }
}
