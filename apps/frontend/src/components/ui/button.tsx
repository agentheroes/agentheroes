import clsx from "clsx";
import * as React from "react";

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "outline" | "default" | "destructive" | "ghost";
    size?: "default" | "sm";
  }
>(({ className, variant = "default", size = "default", ...props }, ref) => {
  return (
    <button
      className={clsx(
        className,
        "bg-[#FD7302] inner-btn shadow-btn rounded-[8px] py-[10px] text-[14px] font-[600] whitespace-nowrap flex items-center justify-center px-[18px] text-center",
        variant === "outline" && "bg-black shadow-none",
        variant === "destructive" && "bg-red-600 shadow-none hover:bg-red-700",
        variant === "ghost" && "bg-transparent shadow-none hover:bg-gray-800",
        size === "sm" && "py-[6px] px-[12px] text-[12px]"
      )}
      ref={ref}
      {...props}
    />
  );
});
Button.displayName = "Button";

export { Button };
