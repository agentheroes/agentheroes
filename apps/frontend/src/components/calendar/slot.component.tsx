import React, { FC, useMemo } from "react";
import dayjs from "dayjs";
import { Button } from "@frontend/components/ui/button";
import { usePostDialog } from "@frontend/components/post";
import { CalendarEvent } from "@frontend/components/calendar/calendar-event";
import { useCalendar } from "@frontend/components/calendar/CalendarContext";
import isBetween from "dayjs/plugin/isBetween";
dayjs.extend(isBetween);

export const SlotComponent: FC<{ date: dayjs.Dayjs }> = (props) => {
  const calendar = useCalendar();

  const events = useMemo(() => {
    return calendar.events.filter((f) =>
      dayjs
        .utc(f.date)
        .isBetween(
          dayjs.utc(props.date).subtract(1, "hour"),
          dayjs.utc(props.date).add(1, "hour"),
        ),
    );
  }, [calendar, props.date]);

  return (
    <>
      <div className="flex flex-col gap-[3px]">
        <SlotComponentInner {...props} />
        {events.map((event) => {
          return (
            <CalendarEvent
              key={event.id}
              title={event.title}
              time={`dadasdasd`}
            />
          );
        })}
      </div>
    </>
  );
};
export const SlotComponentInner: FC<{ date: dayjs.Dayjs }> = (props) => {
  const { date } = props;
  const { openPostDialog } = usePostDialog();

  const isBefore = useMemo(() => {
    return date.isBefore(dayjs());
  }, [date]);

  const handleAddPost = () => {
    // Convert dayjs date to JavaScript Date
    const jsDate = date.toDate();
    openPostDialog(jsDate);
  };

  if (isBefore) {
    return (
      <div className="w-full h-full absolute left-0 top-0 items-center justify-center flex group cursor-not-allowed">
        <div className="group-hover:block hidden opacity-50">Date Passed</div>
      </div>
    );
  }

  return (
    <div className="transition-opacity opacity-0 hover:opacity-100 relative z-[100]">
      <Button className="w-full" onClick={handleAddPost}>
        + Add post
      </Button>
    </div>
  );
};
