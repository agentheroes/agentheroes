import { Provider } from '@prisma/client';
import {ProvidersInterface} from "@backend/services/auth/providers.interface";
import {GithubProvider} from "@backend/services/auth/providers/github.provider";

export class ProvidersFactory {
  static loadProvider(provider: Provider): ProvidersInterface {
    switch (provider) {
      case Provider.GITHUB:
        return new GithubProvider();
    }
  }
}
