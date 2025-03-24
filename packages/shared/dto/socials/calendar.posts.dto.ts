import {IsDateString, IsDefined} from "class-validator";

export class CalendarPosts {
  @IsDateString()
  @IsDefined()
  startDate: string;

  @IsDateString()
  @IsDefined()
  endDate: string;
}
