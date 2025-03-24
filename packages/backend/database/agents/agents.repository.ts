import { Injectable } from "@nestjs/common";
import { PrismaRepository } from "@packages/backend/database/prisma/prisma";
import { CreateAgentDto } from "@packages/shared/dto/agent/create.agent.dto";
import { v4 as uuidv4 } from "uuid";

@Injectable()
export class AgentsRepository {
  constructor(
    private _agents: PrismaRepository<"agent">,
    private _agentStep: PrismaRepository<"agentStep">,
  ) {}

  async createAgent(orgId: string, body: CreateAgentDto, id?: string) {
    const load = await this._agents.model.agent.upsert({
      where: {
        id: id || uuidv4(),
        organizationId: orgId,
      },
      create: {
        name: body.name,
        organizationId: orgId,
        model: body.textModel,
        agentSteps: {
          connectOrCreate: body.nodes.map((p) => ({
            where: {
              organizationId: orgId,
              id: p.id,
            },
            create: {
              id: p.id,
              organizationId: orgId,
              data: JSON.stringify(p.data),
              type: p.type,
              node: p.data.nodeIdentifier,
              renderedText: p.renderedText,
              parentId: p.parent || "",
            },
          })),
        },
      },
      update: {
        name: body.name,
        model: body.textModel,
        agentSteps: {
          connectOrCreate: body.nodes.map((p) => ({
            where: {
              organizationId: orgId,
              id: p.id,
            },
            create: {
              id: p.id,
              organizationId: orgId,
              data: JSON.stringify(p.data),
              type: p.type,
              node: p.data.nodeIdentifier,
              renderedText: p.renderedText,
              parentId: p.parent || "",
            },
          })),
        },
      },
    });

    if (id) {
      for (const node of body.nodes) {
        await this._agentStep.model.agentStep.update({
          where: {
            organizationId: orgId,
            id: node.id,
          },
          data: {
            id: node.id,
            organizationId: orgId,
            data: JSON.stringify(node.data),
            type: node.type,
            node: node.data.nodeIdentifier,
            renderedText: node.renderedText,
            parentId: node.parent || "",
          },
        });
      }

      await this._agentStep.model.agentStep.deleteMany({
        where: {
          agentId: id,
          organizationId: orgId,
          id: {
            notIn: body.nodes.map((p) => p.id),
          },
        },
      });
    }

    return load;
  }

  async getAgent(id: string, org?: string) {
    return this._agents.model.agent.findFirst({
      where: {
        id,
        ...(org ? { organizationId: org } : {}),
        deletedAt: null,
      },
      include: {
        agentSteps: {
          where: {
            deletedAt: null
          },
        },
      },
    });
  }

  async getAgents(org: string) {
    return this._agents.model.agent.findMany({
      where: {
        organizationId: org,
        deletedAt: null,
      },
      include: {
        agentSteps: {
          take: 1,
          where: {
            deletedAt: null,
            parentId: {
              equals: "",
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async deleteAgent(org: string, id: string) {
    return this._agents.model.agent.update({
      where: {
        organizationId: org,
        id,
      },
      data: {
        active: false,
        deletedAt: new Date(),
      },
    });
  }

  async patchAgent(org: string, id: string, body: { active: boolean }) {
    return this._agents.model.agent.update({
      where: {
        organizationId: org,
        id,
      },
      data: {
        active: body.active,
      },
      include: {
        agentSteps: {
          where: {
            deletedAt: null,
            parentId: {
              equals: "",
            },
          },
        },
      },
    });
  }
}
