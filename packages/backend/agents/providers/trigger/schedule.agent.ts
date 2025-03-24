import { Agent, State } from "@packages/backend/agents/agent.workflow.builder";
import { NodeType } from "@packages/shared/agents/agent.flow";
import { Injectable } from "@nestjs/common";

@Injectable()
export class ScheduleAgent implements Agent<{}> {
  type = NodeType.TRIGGER;
  node = "schedule";
  async process(data: {}, state: State) {
    return state;
  }
}
