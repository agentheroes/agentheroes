import { GenerationCategory } from "@packages/backend/generations/generation.category";

export const calculateCredits = (credits: number, type: string) => {
  let remove = 0;
  if (type === GenerationCategory.TRAINER) {
    remove = +process.env.TRAIN_MODEL;
  } else if (
    type === GenerationCategory.NORMAL_IMAGE ||
    type === GenerationCategory.LOOK_A_LIKE_IMAGE
  ) {
    remove = +process.env.PHOTO_CREDITS;
  } else if (type === GenerationCategory.VIDEO) {
    remove = +process.env.VIDEO_CREDITS;
  }

  return credits - remove;
};
