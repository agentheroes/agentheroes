import { Injectable } from "@nestjs/common";
import { makeId } from "@packages/backend/encryption/make.id";
import { EncryptionService } from "@packages/backend/encryption/encryption.service";
import { OrganizationService } from "@packages/backend/database/organizations/organization.service";

export interface ProcessPayment {
  payment_id: number;
  payment_status: string;
  pay_address: string;
  price_amount: number;
  price_currency: string;
  pay_amount: number;
  actually_paid: number;
  pay_currency: string;
  order_id: string;
  order_description: string;
  purchase_id: string;
  created_at: string;
  updated_at: string;
  outcome_amount: number;
  outcome_currency: string;
}

@Injectable()
export class Nowpayments {
  constructor(private _organizationService: OrganizationService) {}

  async processPayment(path: string, body: ProcessPayment) {
    const decrypt = EncryptionService.verifyJWT(path) as any;
    if (!decrypt || !decrypt.order_id) {
      return;
    }

    if (
      body.payment_status !== "confirmed" &&
      body.payment_status !== "finished"
    ) {
      return;
    }

    const [org, id, credits] = body.order_id.split("_");
    await this._organizationService.addCredits(org, id, +credits);

    return body;
  }

  async createPaymentPage(
    frontendUrl: string,
    totalPrice: number,
    totalCredits: number,
    orgId: string,
  ) {
    const onlyId = makeId(5);
    const make = orgId + "_" + onlyId + "_" + totalCredits;
    const signRequest = EncryptionService.signJWT({ order_id: make });

    const { id, invoice_url } = await (
      await fetch("https://api.nowpayments.io/v1/invoice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.NOWPAYMENTS_API_KEY!,
        },
        body: JSON.stringify({
          price_amount: totalPrice,
          price_currency: "USD",
          order_id: make,
          order_description: "Credits for Agent Heroes",
          ipn_callback_url:
            frontendUrl + "/v1/api" + `/public/crypto/${signRequest}`,
          success_url: frontendUrl + `/launches?check=${onlyId}`,
          cancel_url: frontendUrl,
        }),
      })
    ).json();

    return {
      id,
      invoice_url,
    };
  }
}
