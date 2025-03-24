"use client";

import { Button } from "@frontend/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

export function CreateAgentButton() {
  return (
    <Link href="/agents/create" className="mb-6">
      <Button>
        <Plus className="h-4 w-4 mr-2" />
        Create Agent
      </Button>
    </Link>
  );
}
