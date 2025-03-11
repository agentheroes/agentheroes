"use client";

import Link from "next/link";
import { Brush, Clapperboard, Newspaper, Calendar, Settings, PlusCircle, Cog } from "lucide-react";
import { usePathname } from "next/navigation";
import { useUser } from "@frontend/hooks/use-user";

export function Header() {
  const pathname = usePathname();
  const { data: user } = useUser();
  const isActive = (path: string) => pathname === path;

  return (
    <header className="border-b border-border/40 bg-background container max-w-4xl mx-auto max-lg:px-4">
      <div>
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/characters" className="flex items-center gap-2">
              <span className="text-xl font-bold text-primary">HeroAgent</span>
            </Link>
            <nav className="hidden md:flex items-center space-x-6">
              <Link 
                href="/characters" 
                className={`flex items-center gap-2 text-sm font-medium ${
                  isActive('/characters') ? 'text-primary' : 'text-muted-foreground hover:text-primary'
                }`}
              >
                <Brush className="h-4 w-4" />
                <span>Characters</span>
              </Link>
              <Link 
                href="/videos" 
                className={`flex items-center gap-2 text-sm font-medium ${
                  isActive('/videos') ? 'text-primary' : 'text-muted-foreground hover:text-primary'
                }`}
              >
                <Clapperboard className="h-4 w-4" />
                <span>Videos</span>
              </Link>
              <Link 
                href="/news-feed" 
                className={`flex items-center gap-2 text-sm font-medium ${
                  isActive('/news-feed') ? 'text-primary' : 'text-muted-foreground hover:text-primary'
                }`}
              >
                <Newspaper className="h-4 w-4" />
                <span>News Feed</span>
              </Link>
              <Link 
                href="/calendar" 
                className={`flex items-center gap-2 text-sm font-medium ${
                  isActive('/calendar') ? 'text-primary' : 'text-muted-foreground hover:text-primary'
                }`}
              >
                <Calendar className="h-4 w-4" />
                <span>Content Calendar</span>
              </Link>
              {user?.isSuperAdmin && (
                <Link 
                  href="/onboarding" 
                  className={`flex items-center gap-2 text-sm font-medium ${
                    isActive('/onboarding') ? 'text-primary' : 'text-muted-foreground hover:text-primary'
                  }`}
                >
                  <Cog className="h-4 w-4" />
                  <span>System Settings</span>
                </Link>
              )}
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}

