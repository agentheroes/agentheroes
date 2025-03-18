import { IsNumberString } from "class-validator";

export class MediaDto {
  @IsNumberString()
  page: string;
}
