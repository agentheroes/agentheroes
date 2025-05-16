"use client";

import { useState } from "react";
import { PlusCircle } from "lucide-react";
import { useUser } from "@frontend/hooks/use-user";
import { Button } from "@frontend/components/ui/button";
import { CreditsDialog } from "@frontend/components/credits/credits-dialog";

export function CreditsDisplay() {
  const { data: user } = useUser();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  if (!user) return null;

  return (
    <div className="flex items-center gap-2">
      <div className="bg-[#1A1A1A] rounded-full px-4 py-1 text-sm font-medium flex items-center">
        <span className="text-[#FD7302] mr-1">{user.credits}</span>
        <span className="text-[#7E7E81]">credits</span>
      </div>
      <Button 
        variant="ghost" 
        size="sm" 
        className="p-1" 
        onClick={() => setIsDialogOpen(true)}
      >
        <PlusCircle className="h-5 w-5 text-[#FD7302]" />
      </Button>
      
      <CreditsDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </div>
  );
} 