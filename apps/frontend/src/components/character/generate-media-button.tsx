"use client";

import { Button } from "@frontend/components/ui/button";
import { Image } from "lucide-react";
import Link from "next/link";
import { ComponentPropsWithoutRef } from "react";

interface GenerateMediaButtonProps extends ComponentPropsWithoutRef<typeof Button> {
  characterId: string;
  variant?: "default" | "ghost" | "outline";
  size?: "default" | "sm";
}

export function GenerateMediaButton({
  characterId,
  variant = "outline",
  size = "sm",
  className,
  ...props
}: GenerateMediaButtonProps) {
  return (
    <Link href={`/media/create?character=${characterId}`}>
      <Button
        variant={variant}
        size={size}
        className={className}
        {...props}
      >
        <Image className="h-4 w-4" />
      </Button>
    </Link>
  );
} 