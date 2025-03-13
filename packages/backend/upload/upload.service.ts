import { CloudflareStorage } from "./cloudflare.storage";
import { IUploadProvider } from "./upload.interface";
import { LocalStorage } from "./local.storage";
import { Injectable } from "@nestjs/common";

@Injectable()
export class UploadService {
  public service: IUploadProvider;

  constructor() {
    const storageProvider = process.env.STORAGE_PROVIDER || "local";

    switch (storageProvider) {
      case "local":
        console.log("Local provider works only on public servers");
        this.service = new LocalStorage(process.env.UPLOAD_DIRECTORY!);
        break;
      case "cloudflare":
        this.service = new CloudflareStorage(
          process.env.CLOUDFLARE_ACCOUNT_ID!,
          process.env.CLOUDFLARE_ACCESS_KEY!,
          process.env.CLOUDFLARE_SECRET_ACCESS_KEY!,
          process.env.CLOUDFLARE_REGION!,
          process.env.CLOUDFLARE_BUCKETNAME!,
          process.env.CLOUDFLARE_BUCKET_URL!,
        );
        break;
      default:
        throw new Error(`Invalid storage type ${storageProvider}`);
    }
  }
}
