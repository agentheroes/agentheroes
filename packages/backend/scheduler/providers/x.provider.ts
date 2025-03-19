import {
  Post,
  ProviderInterface,
} from "@packages/backend/scheduler/provider.interface";
import { TwitterApi } from "twitter-api-v2";
import { Channels } from "@prisma/client";
import sharp from "sharp";
import { readOrFetch } from "../read.or.fetch";
import { lookup } from "mime-types";

export class X implements ProviderInterface {
  identifier = "x";
  name = 'X (Twitter)';
  selectionRequired = false;
  parseError(err: string) {
    return {type: "refresh_token" as "refresh_token"};
  }

  mapRequest(input: any) {
    return {
      state: input.oauth_token || '',
      code: input.oauth_verifier || '',
      refresh: input.refresh || '',
    }
  }

  provider(
    appSecret: string,
    appKey: string,
    token?: { oauth_token: string; oauth_token_secret: string },
  ) {
    const { oauth_token, oauth_token_secret } = token || {};
    return new TwitterApi({
      appKey: appKey,
      appSecret: appSecret,
      ...(oauth_token && oauth_token_secret
        ? {
            accessToken: oauth_token,
            accessSecret: oauth_token_secret,
          }
        : {}),
    });
  }

  async link(
    redirectUrl: string,
    state: string,
    appSecret: string,
    appKey: string,
  ) {
    const client = this.provider(appSecret, appKey);

    const { url, oauth_token, oauth_token_secret } =
      await client.generateAuthLink(redirectUrl, {
        authAccessType: "write",
        linkMode: "authenticate",
        forceLogin: false
      });

    return {
      url,
      state: oauth_token,
      extra: { oauth_token, oauth_token_secret },
    };
  }

  async auth(
    code: string,
    privateKey: string,
    publicKey: string,
    extra: { oauth_token: string; oauth_token_secret: string },
  ) {
    const startingClient = this.provider(privateKey, publicKey, extra);

    const { accessToken, client, accessSecret } =
      await startingClient.login(code);

    const {
      data: { username, verified, profile_image_url, name, id },
    } = await client.v2.me({
      "user.fields": [
        "username",
        "verified",
        "verified_type",
        "profile_image_url",
        "name",
      ],
    });

    return {
      id: String(id),
      accessToken: accessToken + ":" + accessSecret,
      name,
      refreshToken: "",
      expiresIn: 999999999,
      picture: profile_image_url,
      username,
    };
  }

  async post(
    social: Channels,
    postDetails: Post[],
    privateKey: string,
    publicKey: string,
  ) {
    const [accessTokenSplit, accessSecretSplit] = social.token.split(":");
    const client = this.provider(privateKey, publicKey, {
      oauth_token: accessTokenSplit,
      oauth_token_secret: accessSecretSplit,
    });

    const {
      data: { username },
    } = await client.v2.me({
      "user.fields": "username",
    });

    // upload everything before, you don't want it to fail between the posts
    const uploadAll = (
      await Promise.all(
        postDetails.flatMap((p) =>
          p?.media?.flatMap(async (m) => {
            return {
              id: await client.v1.uploadMedia(
                m.indexOf("mp4") > -1
                  ? Buffer.from(await readOrFetch(m))
                  : await sharp(await readOrFetch(m), {
                      animated: lookup(m) === "image/gif",
                    })
                      .resize({
                        width: 1000,
                      })
                      .gif()
                      .toBuffer(),
                {
                  mimeType: lookup(m) || "",
                },
              ),
              postId: p.id,
            };
          }),
        ),
      )
    ).reduce(
      (acc, val) => {
        if (!val?.id) {
          return acc;
        }

        acc[val.postId] = acc[val.postId] || [];
        acc[val.postId].push(val.id);

        return acc;
      },
      {} as Record<string, string[]>,
    );

    const ids: { internalId: string; url: string }[] = [];
    for (const post of postDetails) {
      const media_ids = (uploadAll[post.id] || []).filter((f) => f);

      // @ts-ignore
      const { data }: { data: { id: string } } = await client.v2.tweet({
        text: post.text,
        ...(media_ids.length ? { media: { media_ids } } : {}),
        ...(ids.length
          ? { reply: { in_reply_to_tweet_id: ids[ids.length - 1] } }
          : {}),
      });

      ids.push({internalId: data.id, url: `https://x.com/${username}/status/${data.id}`});
    }

    return ids;
  }

  async test(privateKey: string, publicKey: string): Promise<boolean> {
    const provider = this.provider(privateKey, publicKey);
    try {
      await provider.appLogin();
      return true;
    } catch (error) {
      return false;
    }
  }
}
