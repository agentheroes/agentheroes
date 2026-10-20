import "reflect-metadata";
import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { test, afterEach } from "node:test";
import {
  DispatchWorkflow,
  AgentTree,
} from "../packages/backend/agents/agent.workflow.builder";
import {
  ParallelSearchAgent,
  SEARCH_MCP_URL,
  SEARCH_USER_AGENT,
} from "../packages/backend/agents/providers/third-party/parallel.search.agent";
import { ApiAgent } from "../packages/backend/agents/providers/trigger/api.agent";
import { GenerateImageAgent } from "../packages/backend/agents/providers/generate-image/generate.image.agent";
import { AgentProcessService } from "../packages/backend/agents/agent.process.service";
import { NodeType } from "../packages/shared/agents/agent.flow";

const originalFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = originalFetch;
});

type Rpc = { id?: number; method: string; params?: any };
type Seen = { rpc: Rpc; headers: Headers; signal?: AbortSignal | null };

function server(call?: (rpc: Rpc, seen: Seen[]) => unknown | Promise<unknown>) {
  const seen: Seen[] = [];
  globalThis.fetch = async (url, init) => {
    assert.equal(String(url), SEARCH_MCP_URL);
    const headers = new Headers(init?.headers);
    assert.equal(headers.get("User-Agent"), SEARCH_USER_AGENT);
    assert.equal(headers.get("Authorization"), null);
    if (init?.method === "GET") return new Response(null, { status: 405 });
    const rpc = JSON.parse(String(init?.body)) as Rpc;
    seen.push({ rpc, headers, signal: init?.signal });
    if (rpc.id === undefined) return new Response(null, { status: 202 });
    let result: unknown;
    if (rpc.method === "initialize") {
      result = {
        protocolVersion: "2025-03-26",
        capabilities: { tools: {} },
        serverInfo: { name: "fixture", version: "1" },
      };
    } else if (rpc.method === "tools/list") {
      result = {
        tools: [{ name: "web_search", inputSchema: { type: "object" } }],
      };
    } else {
      assert.equal(rpc.method, "tools/call");
      assert.equal(rpc.params.name, "web_search");
      result = call
        ? await call(rpc, seen)
        : {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  results: [
                    {
                      title: "Solar research",
                      url: "https://example.org/research?a=1&b=2",
                      excerpts: ["Solar cells improved."],
                    },
                  ],
                }),
              },
            ],
          };
    }
    return new Response(
      JSON.stringify({ jsonrpc: "2.0", id: rpc.id, result }),
      { headers: { "Content-Type": "application/json" } },
    );
  };
  return seen;
}

function node(
  name: string,
  data: object,
  children: AgentTree[] = [],
): AgentTree {
  return {
    node: name,
    type:
      name === "api"
        ? NodeType.TRIGGER
        : name === "generate-image"
          ? NodeType.GENERATE_IMAGE
          : NodeType.THIRD_PARTY,
    data: JSON.stringify(data),
    children,
  } as AgentTree;
}

function runner() {
  const prompts: string[] = [];
  const images: any[] = [];
  const models = {
    generateImage: async (input: any) => {
      images.push(input);
      return ["https://example.org/generated.png"];
    },
  };
  const media = {
    saveMedia: async () => ({ media: "https://example.org/saved.png" }),
  };
  const image = new GenerateImageAgent(models as any, media as any);
  const model = {
    withStructuredOutput: () => ({
      invoke: async (prompt: string) => {
        prompts.push(prompt);
        return { prompt: "a solar character", fileName: "solar.png" };
      },
    }),
  };
  const unused = {
    type: NodeType.THIRD_PARTY,
    node: "unused",
    process: async () => ({}),
  } as any;
  const workflow = new DispatchWorkflow(
    unused,
    image,
    unused,
    unused,
    unused,
    new ApiAgent(models as any),
    unused,
    new ParallelSearchAgent(),
  );
  const run = (tree: AgentTree[], signal?: AbortSignal) =>
    workflow.process(
      "org",
      { prompt: "Existing input" },
      tree,
      model as any,
      new EventEmitter(),
      signal,
    );
  return { run, prompts, images };
}

const search = (query = "solar cell research", children: AgentTree[] = []) =>
  node("web-search", { query }, children);
const calls = (seen: Seen[]) =>
  seen.filter(({ rpc }) => rpc.method === "tools/call");

test("unconfigured search dispatches anonymous MCP and reaches the real generation prompt", async () => {
  // No key/configuration is read by this provider, even if unrelated keys exist.
  const seen = server();
  const { run, prompts, images } = runner();
  await run([
    node("api", { prompt: "Keep my saved prompt" }, [
      search(undefined, [
        node("generate-image", { model: "saved-model", prompt: "make art" }),
      ]),
    ]),
  ]);
  assert.equal(prompts.length, 1);
  assert.match(prompts[0], /Keep my saved prompt/);
  assert.match(prompts[0], /Solar cells improved/);
  assert.match(prompts[0], /https:\/\/example.org\/research\?a=1&b=2/);
  assert.match(prompts[0], /make art/);
  assert.equal(images[0].model, "saved-model");
  assert.equal(images[0].prompt, "a solar character");
  assert.deepEqual(calls(seen)[0].rpc.params.arguments.search_queries, [
    "solar cell research",
  ]);
  assert.equal(
    calls(seen)[0].rpc.params.arguments.objective,
    "solar cell research",
  );
  assert.match(
    calls(seen)[0].rpc.params.arguments.session_id,
    /^[0-9a-f-]{36}$/,
  );
  assert.ok(seen.some(({ rpc }) => rpc.method === "initialize"));
  assert.ok(seen.some(({ rpc }) => rpc.method === "tools/list"));
});

test("saved flows without a search node do not contact Parallel", async () => {
  globalThis.fetch = async () => {
    throw new Error("unexpected network request");
  };
  const { run, prompts } = runner();
  await run([
    node("api", { prompt: "Saved input" }, [
      node("generate-image", { model: "chosen", prompt: "saved style" }),
    ]),
  ]);
  assert.equal(prompts.length, 1);
  assert.match(prompts[0], /Saved input/);
  assert.match(prompts[0], /saved style/);
});

test("inactive workflows cannot dispatch a saved search node", async () => {
  const seen = server();
  let dispatches = 0;
  const service = new AgentProcessService(
    {
      getAgent: async () => ({ active: false, agentSteps: [search()] }),
    } as any,
    {
      process: async () => {
        dispatches++;
      },
    } as any,
    {} as any,
  );
  assert.deepEqual(await service.process("saved-agent", "api"), {
    failure: "api is not activated",
  });
  assert.equal(dispatches, 0);
  assert.equal(seen.length, 0);
});

test("follow-up nodes and retries keep the run ID; concurrent and new runs are isolated", async () => {
  let failure = true;
  const seen = server((rpc) => {
    if (failure) {
      failure = false;
      return {
        isError: true,
        content: [{ type: "text", text: "quota fixture" }],
      };
    }
    return {
      content: [{ type: "text", text: rpc.params.arguments.objective }],
    };
  });
  const { run } = runner();
  await Promise.all([
    run([search("run A", [search("follow-up A")])]),
    run([search("run B", [search("follow-up B")])]),
  ]);
  await run([search("new run")]);
  const groups = new Map<string, Set<string>>();
  for (const { rpc } of calls(seen)) {
    const query = rpc.params.arguments.objective;
    const group = query.includes("A") ? "A" : query.includes("B") ? "B" : "new";
    if (!groups.has(group)) groups.set(group, new Set());
    groups.get(group)!.add(rpc.params.arguments.session_id);
  }
  for (const ids of groups.values()) assert.equal(ids.size, 1);
  assert.equal(new Set([...groups.values()].map((ids) => [...ids][0])).size, 3);
  assert.equal(calls(seen).length, 6);
});

test("tool errors and empty responses stop research branches before generation", async () => {
  for (const response of [
    { isError: true, content: [{ type: "text", text: "quota fixture" }] },
    { content: [] },
  ]) {
    const seen = server(() => response);
    const { run, prompts } = runner();
    const result = await run([
      search(undefined, [node("generate-image", { model: "saved" })]),
    ]);
    assert.equal(prompts.length, 0);
    assert.match(JSON.stringify(result), /could not process node/);
    assert.equal(calls(seen).length, 3);
    assert.equal(
      new Set(calls(seen).map(({ rpc }) => rpc.params.arguments.session_id))
        .size,
      1,
    );
  }
});

test("invalid queries fail before connecting", async () => {
  let network = 0;
  globalThis.fetch = async () => {
    network++;
    throw new Error("unexpected");
  };
  const { run } = runner();
  for (const query of ["", " ", "a".repeat(2001)]) {
    assert.match(
      JSON.stringify(await run([search(query)])),
      /could not process node/,
    );
  }
  assert.equal(network, 0);
});

test("cancelled workflow skips network and downstream generation", async () => {
  const seen = server();
  const controller = new AbortController();
  controller.abort();
  const { run, prompts } = runner();
  await run(
    [search(undefined, [node("generate-image", { model: "saved" })])],
    controller.signal,
  );
  assert.equal(seen.length, 0);
  assert.equal(prompts.length, 0);
});

test("in-flight cancellation reaches the MCP request and stops the branch", async () => {
  const controller = new AbortController();
  const seen = server(async () => {
    controller.abort();
    return await new Promise(() => {});
  });
  const { run, prompts } = runner();
  const result = await run(
    [search(undefined, [node("generate-image", { model: "saved" })])],
    controller.signal,
  );
  assert.match(JSON.stringify(result), /could not process node/);
  assert.equal(prompts.length, 0);
  assert.equal(calls(seen).length, 1);
  assert.equal(calls(seen)[0].signal?.aborted, true);
});

test("HTTP failures do not fall back to another source", async () => {
  let requests = 0;
  globalThis.fetch = async (url, init) => {
    assert.equal(String(url), SEARCH_MCP_URL);
    assert.equal(
      new Headers(init?.headers).get("User-Agent"),
      SEARCH_USER_AGENT,
    );
    requests++;
    return new Response("Service unavailable", { status: 503 });
  };
  const { run, prompts } = runner();
  const result = await run([
    search(undefined, [node("generate-image", { model: "saved" })]),
  ]);
  assert.match(JSON.stringify(result), /could not process node/);
  assert.equal(prompts.length, 0);
  assert.equal(requests, 3);
});

test("SDK request timeout stops the actual dispatcher branch", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const seen = server(async () => {
    queueMicrotask(() => t.mock.timers.tick(30_001));
    return await new Promise(() => {});
  });
  const { run, prompts } = runner();
  const result = await run([
    search(undefined, [node("generate-image", { model: "saved" })]),
  ]);
  assert.match(JSON.stringify(result), /could not process node/);
  assert.equal(prompts.length, 0);
  assert.equal(calls(seen).length, 3);
});
