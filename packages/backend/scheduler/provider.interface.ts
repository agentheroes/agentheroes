import { Channels } from "@prisma/client";

export interface Auth {
  id: string;
  accessToken: string;
  name: string;
  refreshToken: string;
  expiresIn: number;
  picture: string;
  username: string;
}

export interface Post {
  id: string;
  text: string;
  media: string[];
}

type PostId = String[];
type Err = "valid" | "show_user" | "save_to_db";
export interface ProviderInterface {
  identifier: string;
  selectionRequired: boolean;
  test(privateKey: string, publicKey: string): Promise<boolean>;
  mapRequest?: (input: any) => { state: string; code: string; refresh?: string };
  parseError: (error: string) => Err;
  provider(privateKey: string, publicKey: string): any;
  link(
    url: string,
    state: string,
    privateKey: string,
    publicKey: string,
  ): Promise<{ url: string; state: string; extra?: object }>;
  auth(
    code: string,
    privateKey: string,
    publicKey: string,
    extra: any,
  ): Promise<Auth>;
  post(
    social: Channels,
    posts: Post[],
    privateKey: string,
    publicKey: string,
  ): Promise<PostId>;
}
