import { FalProvider } from "@packages/backend/generations/providers/fal.provider";
import { ReplicateProvider } from "@packages/backend/generations/providers/replicate.provider";
import { RunwaymlProvider } from "@packages/backend/generations/providers/runwayml.provider";
import { OpenaiProvider } from "@packages/backend/generations/providers/openai.provider";

export const providersList = [
  new FalProvider(),
  new ReplicateProvider(),
  new RunwaymlProvider(),
  new OpenaiProvider(),
];
