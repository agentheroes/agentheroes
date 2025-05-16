"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@frontend/hooks/use-user";
import { Button } from "@frontend/components/ui/button";
import { CreditsDisplay } from "@frontend/components/credits/credits-display";

export function Header() {
  const pathname = usePathname();
  const { data: user } = useUser();
  const isActive = (path: string) => pathname.indexOf(path) > -1;

  return (
    <header className="h-[88px] px-[32px] bg-[#151515] flex items-center">
      <div className="flex items-center flex-1">
        <Link href="/characters" className="w-[155px]">
          <img src="/logo.svg" alt="Agent Heroes" />
        </Link>
        <nav className="flex items-center text-[18px] flex-1 gap-[20px] justify-center">
          <Link
            href="/characters"
            className={`transition-all hover:bg-black border hover:border-[#333] rounded-[10px] px-[24px] py-[14px] flex items-center gap-2 text-sm font-medium ${
              isActive("/characters")
                ? "text-white bg-black border border-[#333] font-[500]"
                : "border-[#151515] text-[#7E7E81] hover:text-white"
            }`}
          >
            <span>Characters</span>
          </Link>
          <Link
            href="/media"
            className={`transition-all hover:bg-black border hover:border-[#333] rounded-[10px] px-[24px] py-[14px] flex items-center gap-2 text-sm font-medium ${
              isActive("/media")
                ? "text-white bg-black border border-[#333] font-[500]"
                : "border-[#151515] text-[#7E7E81] hover:text-white"
            }`}
          >
            <span>Media</span>
          </Link>
          <Link
            href="/calendar"
            className={`transition-all hover:bg-black border hover:border-[#333] rounded-[10px] px-[24px] py-[14px] flex items-center gap-2 text-sm font-medium ${
              isActive("/calendar")
                ? "text-white bg-black border border-[#333] font-[500]"
                : "border-[#151515] text-[#7E7E81] hover:text-white"
            }`}
          >
            <span>Content Calendar</span>
          </Link>
          <Link
            href="/agents"
            className={`transition-all hover:bg-black border hover:border-[#333] rounded-[10px] px-[24px] py-[14px] flex items-center gap-2 text-sm font-medium ${
              isActive("/agents")
                ? "text-white bg-black border border-[#333] font-[500]"
                : "border-[#151515] text-[#7E7E81] hover:text-white"
            }`}
          >
            <span>Agents</span>
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          {user && <CreditsDisplay />}
          {user?.isSuperAdmin && (
            <Link href="/onboarding">
              <Button>System Settings</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
