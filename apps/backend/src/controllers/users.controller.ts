import { Controller, Get, Headers, Param, Post, Query } from "@nestjs/common";
import { GetUserFromRequest } from "@backend/services/auth/user.from.request";
import { Organization, User } from "@prisma/client";
import { pricing } from "@packages/backend/payments/pricing";
import { GetOrganizationFromRequest } from "@backend/services/auth/org.from.request";
import { Nowpayments } from "@packages/backend/payments/nowpayments.service";
import { IsSuperAdminGuard } from "@backend/services/auth/is.super.admin";
import { UsersService } from "@packages/backend/database/users/users.service";
import { OrganizationService } from "@packages/backend/database/organizations/organization.service";
import { makeId } from "@packages/backend/encryption/make.id";

@Controller("/users")
export class UsersController {
  constructor(
    private _nowpayments: Nowpayments,
    private _usersService: UsersService,
    private _organizationService: OrganizationService,
  ) {}

  @Get("/self")
  async self(
    @GetUserFromRequest() user: User,
    @GetOrganizationFromRequest() organization: Organization,
  ) {
    return { ...user, credits: organization.credits };
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

  @Get("/all-users")
  @IsSuperAdminGuard()
  getAllUsers(@Query() query: { search: string }) {
    return this._usersService.getAllUsers(query.search);
  }

  @Post("/credits/:number")
  @IsSuperAdminGuard()
  addCredits(
    @Param("number") number: string,
    @GetOrganizationFromRequest() organization: Organization,
  ) {
    return this._organizationService.addCredits(
      organization.id,
      makeId(10),
      +number,
    );
  }
}
