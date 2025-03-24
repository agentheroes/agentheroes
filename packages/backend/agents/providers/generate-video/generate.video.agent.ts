"use client";

import { Agent, State } from "@packages/backend/agents/agent.workflow.builder";
import { NodeType } from "@packages/shared/agents/agent.flow";
import { Injectable } from "@nestjs/common";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { ModelsService } from "@packages/backend/database/models/models.service";
import { enhancePrompt } from "@packages/backend/generations/util/enhance.prompt";
import { GenerationCategory } from "@packages/backend/generations/generation.category";
import { MediaService } from "@packages/backend/database/media/media.service";
import { Type } from "@prisma/client";

@Injectable()
export class GenerateVideoAgent
  implements Agent<{ model: string; image?: string; prompt?: string }>
{
  constructor(
    private _modelsService: ModelsService,
    private _mediaService: MediaService,
  ) {}
  type = NodeType.GENERATE_VIDEO;
  node = "generate-video";
  async process(
    data: { model: string; prompt?: string },
    state: State,
    organization: string,
    model: BaseChatModel,
  ) {
    const prompt = state.image_prompt
      ? state.image_prompt
      : !state.prompt && !data.prompt
        ? ""
        : (
            await enhancePrompt(
              (state.prompt || "") + "\n\n" + (data.prompt || ""),
              model,
            )
          ).prompt;

    const url = await this._modelsService.generateVideo({
      model: data.model,
      prompt: prompt,
      saveAsMedia: true,
      images: [],
      type: GenerationCategory.VIDEO,
      amount: 1,
      image: state.image_url,
      baseImage: "",
      name: "",
    });

    const { media } = await this._mediaService.saveMedia(
      "",
      organization,
      prompt,
      Type.VIDEO,
      url[0] as string,
    );

    return { video_url: media as string, image_prompt: prompt };
  }
}
