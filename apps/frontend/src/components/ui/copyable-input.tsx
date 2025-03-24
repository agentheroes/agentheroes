"use client";

import React, { useState } from "react";
import { Input } from "@frontend/components/ui/input";
import { Button } from "@frontend/components/ui/button";
import { Copy, Check } from "lucide-react";
import { useToast } from "@frontend/hooks/use-toast";
import { cn } from "@frontend/lib/utils";

interface CopyableInputProps {
  value: string;
  className?: string;
  successMessage?: string;
}

export function CopyableInput({
  value,
  className,
  successMessage = "Copied to clipboard!",
}: CopyableInputProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast({
        title: "Success",
        description: successMessage,
      });
      
      // Reset the copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  return (
    <div className={cn("relative flex items-center w-[300px]", className)}>
      <Input
        value={value}
        readOnly
        onClick={handleCopy}
        className="pr-10 cursor-pointer hover:border-[#FD7302] focus-visible:ring-[#FD7302]"
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="absolute right-0 h-full px-3 py-0"
        onClick={handleCopy}
      >
        {copied ? (
          <Check className="h-4 w-4 text-green-500" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
} 