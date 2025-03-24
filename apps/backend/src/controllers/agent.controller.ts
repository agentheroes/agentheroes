import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
} from "@nestjs/common";
import { GetOrganizationFromRequest } from "@backend/services/auth/org.from.request";
import { Organization } from "@prisma/client";
import { CreateAgentDto } from "@packages/shared/dto/agent/create.agent.dto";
import { AgentsService } from "@packages/backend/database/agents/agents.service";

@Controller("/agents")
export class AgentController {
  constructor(private readonly _agentsService: AgentsService) {}
  @Post("/")
  createAgent(
    @GetOrganizationFromRequest() org: Organization,
    @Body() body: CreateAgentDto,
  ) {
    return this._agentsService.createAgent(org.id, body);
  }

  @Put("/:id")
  updateAgent(
    @Param("id") id: string,
    @GetOrganizationFromRequest() org: Organization,
    @Body() body: CreateAgentDto,
  ) {
    return this._agentsService.createAgent(org.id, body, id);
  }

  @Patch("/:id/toggle")
  patchAgent(
    @Param("id") id: string,
    @GetOrganizationFromRequest() org: Organization,
    @Body() body: { active: boolean },
  ) {
    return this._agentsService.patchAgent(org.id, id, body);
  }

  @Delete("/:id")
  deleteAgent(
    @Param("id") id: string,
    @GetOrganizationFromRequest() org: Organization,
  ) {
    return this._agentsService.deleteAgent(org.id, id);
  }

  @Get("/:id")
  getAgent(
    @GetOrganizationFromRequest() org: Organization,
    @Param("id") id: string,
  ) {
    return this._agentsService.getAgent(id, org.id);
  }

  @Get("/")
  getAgents(@GetOrganizationFromRequest() org: Organization) {
    return this._agentsService.getAgents(org.id);
  }
}
