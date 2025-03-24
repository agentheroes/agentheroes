import { Injectable } from "@nestjs/common";
import { AgentsService } from "@packages/backend/database/agents/agents.service";
import {
  AgentTree,
  DispatchWorkflow,
} from "@packages/backend/agents/agent.workflow.builder";
import { AgentStep } from "@prisma/client";
import { ModelsService } from "@packages/backend/database/models/models.service";
import { fromEvent, map, Subject } from "rxjs";
import { EventEmitter } from "events";

@Injectable()
export class AgentProcessService {
  constructor(
    private _agentService: AgentsService,
    private _dispatchWorkflow: DispatchWorkflow,
    private _modelService: ModelsService,
  ) {}

  recursiveAgent(tree: AgentStep[], id?: string): AgentTree[] {
    const treeAgents = tree.filter((f) =>
      !id ? !f.parentId : f.parentId === id,
    );
    return treeAgents.map((p) => ({
      ...p,
      children: this.recursiveAgent(tree, p.id),
    }));
  }

  async process(
    id: string,
    type: "schedule" | "api",
    initialState = {},
    asObserver?: boolean,
  ) {
    try {
      const agent = await this._agentService.getAgent(id);
      if (!agent.active) {
        return { failure: "api is not activated" };
      }
      const firstStep = agent.agentSteps.find((p) => !p.parentId);
      if (firstStep.node != type) {
        return;
      }

      const tree = this.recursiveAgent(agent.agentSteps);
      const model = await this._modelService.getTextModel({
        model: agent.model,
      });

      const emitter = new EventEmitter();
      const observer = fromEvent(emitter, "emitter");

      const process = this._dispatchWorkflow.process(
        agent.organizationId,
        initialState,
        tree,
        model,
        emitter,
      );
      if (asObserver) {
        return observer;
      }

      return process;
    } catch (err) {
      return;
    }
  }
}
