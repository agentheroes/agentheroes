import { Controller } from "@nestjs/common";
import { EventPattern, Transport } from "@nestjs/microservices";
import { SchedulerService } from "@packages/backend/scheduler/scheduler.service";

@Controller()
export class SocialsController {
  constructor(private _schedulerService: SchedulerService) {}

  @EventPattern("post", Transport.REDIS)
  async train(data: { id: string }) {
    return this._schedulerService.post(data.id);
  }
}
