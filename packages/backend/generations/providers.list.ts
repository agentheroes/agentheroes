import {FalProvider} from "@packages/backend/generations/providers/fal.provider";
import {ReplicateProvider} from "@packages/backend/generations/providers/replicate.provider";
import {RunwaymlProvider} from "@packages/backend/generations/providers/runwayml.provider";

export const providersList = [
    new FalProvider(),
    new ReplicateProvider(),
    new RunwaymlProvider(),
];