export interface Media {
  id: string;
  characterId: string;
  prompt: string;
  text?: string;
  media: string;
  originalUrl: string;
  createdAt: string;
  updatedAt: string;
  type: "IMAGE" | "VIDEO";
}

export interface MediaResponse {
  count: number;
  media: Media[];
} 