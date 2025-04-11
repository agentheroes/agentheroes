import {
  GenerationBaseInterface, Inference,
  Input,
  ModelEntry,
} from "@packages/backend/generations/generation.base.interface";
import { GenerationIdentifiers } from "@packages/backend/generations/generation.identifiers";
import { GenerationCategory } from "@packages/backend/generations/generation.category";
import { UploadService } from "@packages/backend/upload/upload.service";
import axios from "axios";
import AdmZIP from "adm-zip";
import { makeId } from "@packages/backend/encryption/make.id";
import { Readable } from "stream";

export abstract class GenerationBase implements GenerationBaseInterface {
  upload = new UploadService();
  abstract identifier: GenerationIdentifiers;
  abstract models: ModelEntry<GenerationCategory>[];
  abstract testConnection(apiKey: string): Promise<boolean>;
  abstract docsLink: string;

  transformRequest(model: string, input: Input) {
    return (
      this.models.find((p) => p.model === model)?.mapInput?.(input) || input
    );
  }

  transformInferenceRequest(model: string, input: Inference) {
    return (
      this.models.find((p) => p.inferenceModel === model)?.inferenceMapInput?.(input) || input
    );
  }

  async imagesToZip(images: string[]): Promise<string> {
    const loadImages = await Promise.all(
      images.map(async (imageUrl) => {
        return axios.get(imageUrl, { responseType: "arraybuffer" });
      }),
    );

    const zip = new AdmZIP();
    for (const image of loadImages) {
      zip.addFile(makeId(10) + ".png", image.data);
    }

    const buffer = zip.toBuffer();

    const { path } = await this.upload.service.uploadFile({
      buffer,
      size: buffer.length,
      mimetype: "application/zip",
      path: "",
      fieldname: "",
      originalname: "",
      destination: "",
      filename: "",
      stream: new Readable(),
      encoding: "binary",
    });

    return path as string;
  }

  private getImageExtension(url: string): string {
    // Extract file extension from URL or default to jpg
    const match = url.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
    return match ? match[1].toLowerCase() : "jpg";
  }
}
