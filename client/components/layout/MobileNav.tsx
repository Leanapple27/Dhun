"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Library, Phone } from "lucide-react";
import { cn } from "../../lib/utils";
import { usePlayerStore } from "../../stores/playerStore";

const navItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "Search", href: "/search", icon: Search },
  { name: "Library", href: "/library", icon: Library },
  { name: "Speed Dial", href: "/speed-dial", icon: Phone },
];

export default function MobileNav() {
  const pathname = usePathname();
  const currentTrack = usePlayerStore(state => state.currentTrack);

  return (
    <nav className={cn(
      "md:hidden fixed bottom-0 left-0 right-0 bg-surface/90 backdrop-blur-md border-t border-white/5 z-40 pb-safe",
      currentTrack ? "mb-24" : "mb-0" // Shift up if player is visible
    )}>
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "?");
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 p-2 w-16 transition-colors",
                isActive ? "text-primary" : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              <item.icon className="w-6 h-6" />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
