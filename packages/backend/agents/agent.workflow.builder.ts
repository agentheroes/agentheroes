import { NodeType } from "@packages/shared/agents/agent.flow";
import { AgentStep } from "@prisma/client";
import { GenerateCharacterAgent } from "@packages/backend/agents/providers/generate-image/generate.character.agent";
import { GenerateImageAgent } from "@packages/backend/agents/providers/generate-image/generate.image.agent";
import { GenerateVideoAgent } from "@packages/backend/agents/providers/generate-video/generate.video.agent";
import { SocialMediaAgent } from "@packages/backend/agents/providers/publish/social.media.agent";
import { RssAgent } from "@packages/backend/agents/providers/third-party/rss.agent";
import { ApiAgent } from "@packages/backend/agents/providers/trigger/api.agent";
import { ScheduleAgent } from "@packages/backend/agents/providers/trigger/schedule.agent";
import { Injectable } from "@nestjs/common";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { EventEmitter } from "events";

export interface State {
  prompt?: string;
  image_prompt?: string;
  image_url?: string;
  video_url?: string;
  social_media_urls?: string[];
}
export interface Agent<T> {
  type: NodeType;
  node: string;
  process(
    info: T,
    state: State,
    organization: string,
    model: BaseChatModel,
  ): Promise<State>;
}

export interface AgentTree extends AgentStep {
  children: AgentTree[];
}

@Injectable()
export class DispatchWorkflow {
  private _agentList: Agent<any>[];
  constructor(
    _generateCharacterAgent: GenerateCharacterAgent,
    _generateImageAgent: GenerateImageAgent,
    _generateVideoAgent: GenerateVideoAgent,
    _socialMediaAgent: SocialMediaAgent,
    _rssAgent: RssAgent,
    _apiAgent: ApiAgent,
    _scheduleAgent: ScheduleAgent,
  ) {
    this._agentList = [
      _generateCharacterAgent,
      _generateImageAgent,
      _generateVideoAgent,
      _socialMediaAgent,
      _rssAgent,
      _apiAgent,
      _scheduleAgent,
    ];
  }

  async process(
    organization: string,
    state: object,
    agentTree: AgentTree[],
    model: BaseChatModel,
    subject: EventEmitter<any>,
  ): Promise<object[]> {
    const process = await this.processProcess(
      organization,
      state,
      agentTree,
      model,
      subject,
    );
    setTimeout(
      () =>
        subject.emit("emitter", {
          data: "stop",
        }),
      1,
    );
    return process;
  }

  async processProcess(
    organization: string,
    state: object,
    agentTree: AgentTree[],
    model: BaseChatModel,
    subject: EventEmitter<any>,
  ): Promise<object[]> {
    const nodes = agentTree.map((p) =>
      this._agentList.find((a) => a.node === p.node && p.type === a.type),
    );

    if (nodes.length === 0) {
      return [];
    }

    return Promise.all(
      nodes.map(async (node, index: number) => {
        setTimeout(
          () =>
            subject.emit("emitter", {
              data: { type: node.type, node: node.node, state },
            }),
          1,
        );
        let totalTries = 3;
        let e: any;
        while (totalTries !== 0) {
          try {
            const value = await node.process(
              JSON.parse(agentTree[index].data),
              state,
              organization,
              model,
            );
            return {
              node: node.node,
              type: node.type,
              value,
              children: await this.processProcess(
                organization,
                { ...state, ...value },
                agentTree[index].children,
                model,
                subject,
              ),
            };
          } catch (err) {
            e = err;
            totalTries--;
          }
        }

        setTimeout(
          () =>
            subject.emit("emitter", {
              data: { type: 'error', node: JSON.stringify(e) },
            }),
          1,
        );

        return [
          {
            error: {
              type: node.type,
              node: node.node,
              msg: "could not process node",
            },
          },
        ];
      }),
    );
  }
}
