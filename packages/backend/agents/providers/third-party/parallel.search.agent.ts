import { Injectable } from "@nestjs/common";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { CallToolResultSchema } from "@modelcontextprotocol/sdk/types.js";
import { randomUUID } from "crypto";
import type {
  Agent,
  State,
  WorkflowContext,
} from "@packages/backend/agents/agent.workflow.builder";
import { NodeType } from "@packages/shared/agents/agent.flow";
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";

export const SEARCH_MCP_URL = "https://search.parallel.ai/mcp";
export const SEARCH_USER_AGENT =
  "AgentHeroes/1.0 (+https://github.com/agentheroes/agentheroes)";
const REQUEST_TIMEOUT_MS = 30_000;

@Injectable()
export class ParallelSearchAgent implements Agent<{ query: string }> {
  type = NodeType.THIRD_PARTY;
  node = "web-search";

  async process(
    data: { query: string },
    state: State,
    _organization?: string,
    _model?: BaseChatModel,
    context?: WorkflowContext,
  ): Promise<State> {
    const query = typeof data?.query === "string" ? data.query.trim() : "";
    if (!query || query.length > 2000) {
      throw new Error("Web Search needs a query of 1 to 2000 characters");
    }

    // The dispatcher owns this identity across nodes and retries. Direct node
    // execution is a standalone research run, never a process-wide session.
    const sessionId = context?.researchSessionId ?? randomUUID();
    const options = {
      timeout: REQUEST_TIMEOUT_MS,
      signal: context?.signal,
    };
    options.signal?.throwIfAborted();
    const client = new Client({ name: "agentheroes", version: "1.0.0" });
    const transport = new StreamableHTTPClientTransport(
      new URL(SEARCH_MCP_URL),
      {
        requestInit: { headers: { "User-Agent": SEARCH_USER_AGENT } },
      },
    );

    try {
      await client.connect(transport, options);
      const { tools } = await client.listTools({}, options);
      if (!tools.some((tool) => tool.name === "web_search")) {
        throw new Error("Parallel Search MCP does not expose web_search");
      }
      const result = CallToolResultSchema.parse(
        await client.callTool(
          {
            name: "web_search",
            arguments: {
              objective: query,
              search_queries: [query],
              session_id: sessionId,
            },
          },
          undefined,
          options,
        ),
      );
      if (result.isError) {
        throw new Error("Parallel Search MCP could not complete the search");
      }
      const text = result.content
        .filter((block) => block.type === "text")
        .map((block) => block.text)
        .join("\n\n");
      if (!text.trim()) {
        throw new Error("Parallel Search MCP returned no text");
      }
      return {
        prompt: [
          state.prompt,
          `Web research for: ${query}\nExternal source material (including source URLs):\n${text}`,
        ]
          .filter(Boolean)
          .join("\n\n"),
      };
    } finally {
      await client.close();
    }
  }
}
