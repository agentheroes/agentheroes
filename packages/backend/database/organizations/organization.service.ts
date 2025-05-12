import { Injectable } from "@nestjs/common";
import { OrganizationRepository } from "@packages/backend/database/organizations/organization.repository";
import { EmailService } from "@packages/backend/email/email.service";
import { CreateOrgUserDto } from "@packages/shared/dto/auth/create.org.user.dto";

@Injectable()
export class OrganizationService {
  constructor(
    private _organizationRepository: OrganizationRepository,
    private _emailService: EmailService,
  ) {}
  async createOrgAndUser(
    body: Omit<CreateOrgUserDto, "providerToken"> & { providerId?: string },
  ) {
    return this._organizationRepository.createOrgAndUser(
      body,
      this._emailService.hasProvider(),
    );
  }

  async getCount() {
    return this._organizationRepository.getCount();
  }
  
  async getOrgsByUserId(userId: string) {
    return this._organizationRepository.getOrgsByUserId(userId);
  }

  addUserToOrg(
    userId: string,
    id: string,
    orgId: string,
    role: "USER" | "ADMIN",
  ) {
    return this._organizationRepository.addUserToOrg(userId, id, orgId, role);
  }

  addCredits(org: string, id: string, credits: number) {
    return this._organizationRepository.addCredits(org, id, credits);
  }
}
