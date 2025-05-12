import { Body, Controller, Param, Post } from "@nestjs/common";
import { Nowpayments } from "@packages/backend/payments/nowpayments.service";

@Controller("/public")
export class PublicController {
  constructor(private readonly _nowpayments: Nowpayments) {}
  @Post("/crypto/:path")
  async cryptoPost(@Body() body: any, @Param("path") path: string) {
    console.log("cryptoPost", body, path);
    return this._nowpayments.processPayment(path, body);
  }
}
