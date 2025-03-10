import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { User } from '@prisma/client';
import {OrganizationService} from "@packages/backend/database/organizations/organization.service";
import {UsersService} from "@packages/backend/database/users/users.service";
import {EncryptionService} from "@packages/backend/encryption/encryption.service";
import {HttpForbiddenException, HttpUnauthorized} from "@packages/backend/exceptions/http.exceptions";

export const removeAuth = (res: Response) => {
  res.cookie('auth', '', {
    domain: process.env.FRONTEND_URL,
    ...(!process.env.NOT_SECURED
      ? {
          secure: true,
          httpOnly: true,
          sameSite: 'none',
        }
      : {}),
    expires: new Date(0),
    maxAge: -1,
  });

  res.header('logout', 'true');
};

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private _organizationService: OrganizationService,
    private _userService: UsersService
  ) {}
  async use(req: Request, res: Response, next: NextFunction) {
    const auth = req.headers.auth || req.cookies.auth;
    if (!auth) {
      throw new HttpUnauthorized();
    }
    try {
      let user = EncryptionService.verifyJWT(auth) as User | null;
      const orgHeader = req.cookies.showorg || req.headers.showorg;

      if (!user) {
        throw new HttpUnauthorized();
      }

      if (!user.activated) {
        throw new HttpUnauthorized();
      }

      delete user.password;
      const organization = (
        await this._organizationService.getOrgsByUserId(user.id)
      ).filter((f) => !f.users[0].disabled);
      const setOrg =
        organization.find((org) => org.id === orgHeader) || organization[0];

      if (!organization) {
        throw new HttpUnauthorized();
      }

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      req.user = user;

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      req.org = setOrg;
    } catch (err) {
      throw new HttpUnauthorized();
    }
    next();
  }
}
