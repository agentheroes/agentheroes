import React, { FC, useMemo } from "react";
import dayjs from "dayjs";
import { Button } from "@frontend/components/ui/button";
import { usePostDialog } from "@frontend/components/post";
import { CalendarEvent } from "@frontend/components/calendar/calendar-event";
import { useCalendar } from "@frontend/components/calendar/CalendarContext";
import isBetween from "dayjs/plugin/isBetween";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import {useSocialMedia} from "@frontend/components/calendar/SocialMediaContext";

// Extend dayjs with necessary plugins
dayjs.extend(isBetween);
dayjs.extend(utc);
dayjs.extend(timezone);

const calculateDates = (view: "day" | "month" | "week", date: dayjs.Dayjs) => {
  if (view === "month") {
    return {
      slotStart: date.startOf("day"),
      slotEnd: date.endOf("day"),
    };
  }

  return {
    slotStart: date.startOf("hour").subtract(1, "minute"),
    slotEnd: date.endOf("hour"),
  };
};

export const SlotComponent: FC<{
  date: dayjs.Dayjs;
  view: "day" | "month" | "week";
}> = (props) => {
  const calendar = useCalendar();
  const social = useSocialMedia();
  const events = useMemo(() => {
    // Log current slot's date for debugging
    return calendar.events.filter((event) => {
      // Parse the event date with dayjs, ensuring proper timezone handling
      const eventDate = dayjs(event.date);

      // Create a start and end range for this time slot
      const { slotStart, slotEnd } = calculateDates(props.view, props.date);

      // Check if the event falls within the current slot's time range
      const isInSlot = eventDate.isBetween(slotStart, slotEnd);

      return isInSlot;
    }).map(p => ({
      ...p,
      channel: social.socials.find(a => a.id === p.channel)
    }))
  }, [calendar.events, social, props.date, props.view]);

  return (
    <>
      <div className="flex flex-col gap-[3px]">
        <SlotComponentInner {...props} />
        {events.map((event) => {
          return (
            <CalendarEvent
              key={event.id}
              title={event.title}
              channel={event.channel}
              type={event.type}
              time={dayjs(event.date).format("HH:mm")}
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
