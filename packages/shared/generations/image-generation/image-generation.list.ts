import { ReplicateProvider } from "@packages/shared/generations/image-generation/replicate.provider";
import { FalProvider } from "@packages/shared/generations/image-generation/fal.provider";

export const imageGenerationList = [new ReplicateProvider(), new FalProvider()];
