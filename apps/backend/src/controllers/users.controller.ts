import { Controller, Get, Headers, Param } from "@nestjs/common";
import { GetUserFromRequest } from "@backend/services/auth/user.from.request";
import { Organization, User } from "@prisma/client";
import { pricing } from "@packages/backend/payments/pricing";
import { GetOrganizationFromRequest } from "@backend/services/auth/org.from.request";
import { Nowpayments } from "@packages/backend/payments/nowpayments.service";

@Controller("/users")
export class UsersController {
  constructor(private _nowpayments: Nowpayments) {}

  @Get("/self")
  async self(
      @GetUserFromRequest() user: User,
      @GetOrganizationFromRequest() organization: Organization,
  ) {
    return {...user, credits: organization.credits};
  }

  @Get("/pricing")
  getPricing() {
    return [...pricing];
  }

  @Get("/pricing/:identifier/url")
  getPricingUrl(
    @GetOrganizationFromRequest() organization: Organization,
    @Param("identifier") identifier: string,
    @Headers("refer") refer: string,
  ) {
    const findPricing = pricing.find((p) => p.identifier === identifier);
    if (!findPricing) {
      return null;
    }

    return this._nowpayments.createPaymentPage(
      new URL(refer).origin,
      findPricing.price,
      findPricing.credits,
      organization.id,
    );
  }
}
