"use client";

import { Agent, State } from "@packages/backend/agents/agent.workflow.builder";
import { NodeType } from "@packages/shared/agents/agent.flow";
import { Injectable } from "@nestjs/common";
import { SocialService } from "@packages/backend/database/social/social.service";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { makeId } from "@packages/backend/encryption/make.id";
import dayjs from "dayjs";
import { v4 as uuidv4 } from "uuid";
import { socialMediaText } from "@packages/backend/generations/util/social.media.text";

@Injectable()
export class SocialMediaAgent
  implements
    Agent<{ text?: string; selectedChannels: string[]; media?: string }>
{
  constructor(private _socialService: SocialService) {}
  type = NodeType.PUBLISH;
  node = "social-media";
  async process(
    data: { text?: string; selectedChannels: string[]; media?: string },
    state: State,
    organization: string,
    model: BaseChatModel,
  ) {
    for (const channel of data.selectedChannels) {
      await this._socialService.savePost(organization, {
        type: "now",
        group: makeId(10),
        date: dayjs.utc().format("YYYY-MM-DD HH:mm:ss:0"),
        list: [
          {
            channel,
            posts: [
              {
                order: 1,
                id: uuidv4(),
                media: [state.video_url || state.image_url].filter((f) => f),
                text: await socialMediaText(
                  `${state.prompt || ""}\n\n${data.text || ""}`,
                  model,
                ),
              },
            ],
          },
        ],
      });
    }
    return {};
  }
}
