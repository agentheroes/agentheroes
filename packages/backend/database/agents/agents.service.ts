import { Injectable } from "@nestjs/common";
import { AgentsRepository } from "@packages/backend/database/agents/agents.repository";
import { CreateAgentDto } from "@packages/shared/dto/agent/create.agent.dto";
import { BullMqClient } from "@packages/backend/bull-mq-transport-new/client";

@Injectable()
export class AgentsService {
  constructor(
    private _agentsRepository: AgentsRepository,
    private _workerServiceProducer: BullMqClient,
  ) {}

  async stopAgent(id: string) {
    await this._workerServiceProducer.deleteScheduler("scheduler", id);
  }

  async startAgent(id: string, interval: number) {
    this._workerServiceProducer.emit("scheduler", {
      id,
      options: {
        every: 1000 * 60 * 60 * interval,
      },
      payload: {
        id,
      },
    });
  }

  async createAgent(orgId: string, body: CreateAgentDto, id?: string) {
    const agent = await this._agentsRepository.createAgent(orgId, body, id);
    await this.stopAgent(agent.id);
    if (agent.active && body.nodes[0].data.nodeIdentifier === "schedule") {
      await this.startAgent(agent.id, +body.nodes[0].data.interval);
    }
    return agent;
  }

  async getAgent(id: string, org?: string) {
    return this._agentsRepository.getAgent(id, org);
  }

  async getAgents(org: string) {
    return this._agentsRepository.getAgents(org);
  }

  async deleteAgent(org: string, id: string) {
    await this.stopAgent(id);
    return this._agentsRepository.deleteAgent(org, id);
  }

  async patchAgent(org: string, id: string, body: { active: boolean }) {
    if (!body.active) {
      await this.stopAgent(id);
    }

    const patch = await this._agentsRepository.patchAgent(org, id, body);
    if (body.active && patch.agentSteps[0].node === "schedule") {
      await this.startAgent(
        patch.id,
        +JSON.parse(patch.agentSteps[0].data).interval,
      );
    }

    return patch;
  }
}
