"use client";

import { Agent, State } from "@packages/backend/agents/agent.workflow.builder";
import { NodeType } from "@packages/shared/agents/agent.flow";
import { Injectable } from "@nestjs/common";
import Parser from "rss-parser";
const parser = new Parser();

@Injectable()
export class RssAgent implements Agent<{ url: string }> {
  type = NodeType.THIRD_PARTY;
  node = "rss-feed";
  async process(data: { url: string }, state: State) {
    const feed = await parser.parseURL(data.url);

    return {
      prompt: feed.items[0].title + "\n\n" + feed.items[0].contentSnippet,
    };
  }
}
