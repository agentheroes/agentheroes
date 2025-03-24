"use client";

import { FC, ReactNode } from 'react';
import { Button } from "@frontend/components/ui/button";
import { cn } from "@frontend/lib/utils";

interface NodeButtonProps {
  onClick: () => void;
  children: ReactNode;
  variant?: 'default' | 'outline' | 'destructive' | 'ghost';
  className?: string;
  size?: "default" | "sm";
}

export const NodeButton: FC<NodeButtonProps> = ({ 
  onClick, 
  children, 
  variant = 'default',
  size = "default",
  className
}) => {
  return (
    <Button
      onClick={onClick}
      variant={variant}
      size={size}
      className={cn(
        "w-full flex items-center justify-center gap-2 font-semibold",
        variant === 'outline' && "hover:bg-[#1F1F1F] border-[#2A2A2A]",
        variant === 'default' && "hover:bg-[#E86B01]",
        className
      )}
    >
      {children}
    </Button>
  );
}; 