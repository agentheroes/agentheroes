import {Body, Controller, Get, Param, Post, Query, Res, Sse} from "@nestjs/common";
import { AgentProcessService } from "@packages/backend/agents/agent.process.service";
import { Observable } from "rxjs";
import { Response } from "express";

@Controller("/trigger")
export class TriggerController {
  constructor(private _agentProcessService: AgentProcessService) {}
  @Post("/:id")
  trigger(@Param("id") id: string, @Body() body: any) {
    return this._agentProcessService.process(id, "api", body);
  }

  @Post("/:id/events")
  async triggerSSE(
    @Param("id") id: string,
    @Body() body: any,
    @Res() res: Response,
  ) {
    res.set({
      'Cache-Control': 'private, no-cache, no-store, must-revalidate, max-age=0, no-transform',
      'Connection': 'keep-alive',
      'Content-Type': 'text/event-stream',
    })

    res.flushHeaders();

    const observer: Observable<any> = (await this._agentProcessService.process(
      id,
      "api",
      body,
      true,
    )) as any;

    observer.subscribe({
      next: (data) => {
        if (data.data === "stop") {
          return res.end();
        }
        res.write("data: " + JSON.stringify(data.data) + "\n\n");
      },
    });
  }
}
