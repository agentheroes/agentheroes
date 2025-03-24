"use client";

import { Agent, State } from "@packages/backend/agents/agent.workflow.builder";
import { NodeType } from "@packages/shared/agents/agent.flow";
import { Injectable } from "@nestjs/common";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { enhancePrompt } from "@packages/backend/generations/util/enhance.prompt";
import { ModelsService } from "@packages/backend/database/models/models.service";

@Injectable()
export class GenerateCharacterAgent
  implements Agent<{ model: string; prompt?: string; character: string }>
{
  constructor(private _modelsService: ModelsService) {}
  type = NodeType.GENERATE_IMAGE;
  node = "generate-character";
  async process(
    data: { prompt: string; model: string; character: string },
    state: State,
    organization: string,
    model: BaseChatModel,
  ) {
    const newPrompt = await enhancePrompt(
      (state.prompt || "") + "\n\n" + (data.prompt || ""),
      model,
    );

    const {media} = await this._modelsService.generateCharacter(
      "",
      organization,
      data.character,
      {
        type: "IMAGE",
        videoModel: data.model,
        prompt: newPrompt.prompt,
        image: "",
      },
    );

    return {
      image_url: media as string,
      image_prompt: newPrompt.prompt,
    };
  }
}
