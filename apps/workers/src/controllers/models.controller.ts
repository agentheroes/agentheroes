import { Controller } from "@nestjs/common";
import { EventPattern, Transport } from "@nestjs/microservices";
import { ModelsService } from "@packages/backend/database/models/models.service";
import { AgentProcessService } from "@packages/backend/agents/agent.process.service";

@Controller()
export class ModelsController {
  constructor(
    private _modelsService: ModelsService,
    private _agentProcessService: AgentProcessService,
  ) {}

  @EventPattern("train", Transport.REDIS)
  async train(data: { id: string }) {
    console.log("processing", data);
    return this._modelsService.processTrainModel(data.id);
  }

  @EventPattern("scheduler", Transport.REDIS)
  async scheduler(data: { id: string }) {
    console.log("processing", data);
    return this._agentProcessService.process(data.id, 'schedule');
  }
}
