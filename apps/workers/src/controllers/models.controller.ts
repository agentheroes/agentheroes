import { Controller } from "@nestjs/common";
import { EventPattern, Transport } from "@nestjs/microservices";
import { ModelsService } from "@packages/backend/database/models/models.service";

@Controller()
export class ModelsController {
  constructor(private _modelsService: ModelsService) {}

  @EventPattern("train", Transport.REDIS)
  async train(data: { id: string }) {
    console.log("processing", data);
    return this._modelsService.processTrainModel(data.id);
  }
}
