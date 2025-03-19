import { SchedulerList } from "@packages/backend/scheduler/scheduler.list";
import { makeId } from "@packages/backend/encryption/make.id";
import { ioRedis } from "@packages/backend/redis/redis.service";
import { SocialService } from "@packages/backend/database/social/social.service";
import { Injectable } from "@nestjs/common";

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

  async generateURL(
    orgId: string,
    refererDomain: string,
    identifier: string,
    timezone: number,
    rootInternalId?: string,
    internalId?: string,
  ) {
    const provider = SchedulerList.find((p) => p.identifier === identifier);
    if (!provider) return;

    const state = makeId(20);
    const keys = await this.getKeys(identifier);
    if (!keys) {
      return;
    }

    const redirectUrl = `${refererDomain}/v1/api/redirect?provider=${identifier}`;
    const {
      url,
      extra,
      state: newState,
    } = await provider.link(
      redirectUrl,
      state,
      keys.privateKey,
      keys.publicKey,
    );

    ioRedis.set(
      `integration:${newState}`,
      JSON.stringify({
        identifier,
        orgId,
        extra,
        rootInternalId,
        internalId,
        redirectTo: "/calendar",
        timezone: +timezone,
      }),
      "EX",
      300,
    );

    return url;
  }

  private async _providerAndConnection(
    query: any,
    state?: string,
    identifier?: string,
  ) {
    if (identifier) {
      const provider = SchedulerList.find((p) => p.identifier === identifier);
      if (!provider) return {};

      const newQuery = provider?.mapRequest?.(query) || query;
      const getConnection = await ioRedis.get(`integration:${newQuery.state}`);
      if (!getConnection) return {};
      await ioRedis.del(`integration:${newQuery.state}`);
      const parsedConnection = JSON.parse(getConnection);

      return {
        provider,
        parsedConnection,
        newQuery,
      };
    }

    if (state) {
      const getConnection = await ioRedis.get(`integration:${state}`);
      if (!getConnection) return {};
      const parsedConnection = JSON.parse(getConnection);
      const provider = SchedulerList.find(
        (p) => p.identifier === parsedConnection.identifier,
      );
      await ioRedis.del(`integration:${parsedConnection.state}`);

      return {
        provider,
        parsedConnection,
        newQuery: undefined,
      };
    }

    return {};
  }

  async authenticate(query: any, identifier?: string) {
    const { provider, parsedConnection, newQuery } =
      await this._providerAndConnection(query, query.state, identifier);
    if (!provider && !parsedConnection) return;

    const keys = await this.getKeys(parsedConnection.identifier);
    const info = await provider.auth(
      newQuery.code,
      keys.privateKey,
      keys.publicKey,
      parsedConnection?.extra,
    );

    await this._socialService.save(parsedConnection.orgId, {
      token: info.accessToken,
      refreshToken: newQuery.refresh || info.refreshToken,
      expiresIn: info.expiresIn,
      identifier: parsedConnection.identifier,
      timezone: parsedConnection.timezone,
      rootInternalId: parsedConnection.rootInternalId || info.id,
      currentInternalId: parsedConnection.internalId || info.id,
      name: info.name,
      username: info.username,
      profilePic: info.picture,
      shouldRefresh: false,
      selectionRequired: provider.selectionRequired,
      organizationId: parsedConnection.orgId,
    });

    return parsedConnection.redirectTo;
  }

  async post(groupId: string) {
    const post = await this._socialService.getPostsByGroup(groupId);
    if (post.length == 0) {
      return;
    }

    const keys = await this.getKeys(post[0].channel.identifier);
    if (!keys) {
      return;
    }

    const provider = SchedulerList.find(
      (p) => p.identifier === post[0].channel.identifier,
    );

    if (!provider) {
      return;
    }

    try {
      const ids = await provider.post(
        post[0].channel,
        post.map((p) => ({
          id: p.id,
          text: p.content,
          media: JSON.parse(p.media),
        })),
        keys.privateKey,
        keys.publicKey,
      );

      return this._socialService.updatePostStatuses(
        ids.map((p, index) => ({
          status: "POSTED",
          internalId: p.internalId,
          id: post[index].id,
        })),
      );
    } catch (err) {
      const load = provider.parseError(err);
      return this._socialService.updatePostStatuses(
        post.map((p, index) => ({
          status: "ERROR",
          id: p.id,
          error: JSON.stringify(err),
        })),
      );
    }
  }
}
