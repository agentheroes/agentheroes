import { Agent, State } from "@packages/backend/agents/agent.workflow.builder";
import { NodeType } from "@packages/shared/agents/agent.flow";
import { Injectable } from "@nestjs/common";
import { ModelsService } from "@packages/backend/database/models/models.service";

@Injectable()
export class ApiAgent implements Agent<{ prompt?: string }> {
  constructor(private _modelService: ModelsService) {}
  type = NodeType.TRIGGER;
  node = "api";
  async process(data: { prompt: string }, state: State) {
    return data.prompt ? { prompt: data.prompt } : {};
  }
}
