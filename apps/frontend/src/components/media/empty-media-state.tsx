"use client";

import { Button } from "@frontend/components/ui/button";
import { Image } from "lucide-react";
import Link from "next/link";

export function EmptyMediaState() {
  return (
    <div className="border border-[#3B3B3B] rounded-lg p-4 text-center flex flex-col items-center justify-center h-64 bg-[#151515] col-span-full">
      <Image className="h-12 w-12 text-[#F0F0F0] mb-2" />
      <p className="text-[#F0F0F0]">No media yet</p>
      <Link href="/media/create" className="mt-4">
        <Button>Create Your First Media</Button>
      </Link>
    </div>
  );
} 