import clsx from "clsx";
import * as React from "react";

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => {
  return (
    <button
      className={clsx(
        className,
        "bg-[#FD7302] shadow-btn rounded-[8px] py-[10px] text-[14px] font-[600] whitespace-nowrap flex items-center justify-center px-[18px] text-center",
      )}
      ref={ref}
      {...props}
    />
  );
});
Button.displayName = "Button";

export { Button };
