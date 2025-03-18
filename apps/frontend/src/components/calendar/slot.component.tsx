import { FC, useMemo } from "react";
import dayjs from "dayjs";
import { Button } from "@frontend/components/ui/button";
import { usePostDialog } from "@frontend/components/post";

export const SlotComponent: FC<{ date: dayjs.Dayjs }> = (props) => {
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
