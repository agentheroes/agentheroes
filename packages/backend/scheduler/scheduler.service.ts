import { SchedulerList } from "@packages/backend/scheduler/scheduler.list";
import { makeId } from "@packages/backend/encryption/make.id";
import { ioRedis } from "@packages/backend/redis/redis.service";
import { SocialService } from "@packages/backend/database/social/social.service";
import {Injectable} from "@nestjs/common";

@Injectable()
export class SchedulerService {
  constructor(private _socialService: SocialService) {}

  getKeys(identifier: string) {
    return this._socialService.getKeys(identifier);
  }

  checkKeys(identifier: string, privateKey: string, publicKey: string) {
    const provider = SchedulerList.find((p) => p.identifier === identifier);
    return provider.test(privateKey, publicKey);
  }

  async generateURL(orgId: string, refererDomain: string, identifier: string) {
    const provider = SchedulerList.find((p) => p.identifier === identifier);
    if (!provider) return;

    const state = makeId(20);
    const keys = await this.getKeys(identifier);
    if (!keys) {
      return ;
    }
    const redirectUrl = `${refererDomain}/redirect/${state}`;

    const { url, extra } = await provider.link(
      redirectUrl,
      keys.privateKey,
      keys.publicKey,
    );

    ioRedis.set(
      `integration:${state}`,
      JSON.stringify({ identifier, orgId, extra }),
      "EX",
      300,
    );

    return url;
  }

  async authenticate(timezone: number, query: any, state: string) {
    const getConnection = await ioRedis.get(`integration:${state}`);
    if (!getConnection) return;

    await ioRedis.del(`integration:${state}`);

    const parsedConnection = JSON.parse(getConnection);

    const provider = SchedulerList.find(
      (p) => p.identifier === parsedConnection.identifier,
    );
    if (!provider) return;

    const getCode = provider?.mapRequest?.(query) || query.code;
    const keys = await this.getKeys(parsedConnection.identifier);

    const info = await provider.auth(
      getCode,
      keys.privateKey,
      keys.publicKey,
      parsedConnection?.extra,
    );

    return this._socialService.save(parsedConnection.orgId, {
      token: info.accessToken,
      refreshToken: info.refreshToken,
      expiresIn: info.expiresIn,
      name: info.name,
      username: info.username,
      identifier: parsedConnection.identifier,
      timezone,
      profilePic: info.picture,
      rootInternalId: info.id,
      currentInternalId: info.id,
      shouldRefresh: false,
      selectionRequired: provider.selectionRequired,
      organizationId: parsedConnection.orgId,
    });
  }
}
