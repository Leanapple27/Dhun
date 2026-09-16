"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Search,
  Library,
  Phone,
  Music,
  Plus,
  Radio,
  Users2,
  FolderPlus,
  Upload,
  Music2,
  X
} from "lucide-react";
import { cn } from "../../lib/utils";
import { usePlaylistStore } from "../../stores/playlistStore";
import { useAuthStore } from "../../stores/authStore";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import PlaylistImportModal from "../playlist/PlaylistImportModal";

const topNavItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "Search", href: "/search", icon: Search },
  { name: "Podcasts", href: "/podcasts", icon: Radio },
  { name: "Speed Dial", href: "/speed-dial", icon: Phone }
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuthStore();
  const { playlists, createPlaylist } = usePlaylistStore();

  const [filterType, setFilterType] = useState<"all" | "playlists" | "podcasts">("all");
  const [librarySearch, setLibrarySearch] = useState("");
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const handleCreateNewPlaylist = () => {
    const newId = createPlaylist();
    router.push(`/playlist/${newId}`);
  };

  const handleCreateBlend = () => {
    const newId = createPlaylist("Dhun Blend", "Shared taste mix between you and friends.", undefined, true);
    router.push(`/playlist/${newId}`);
  };

  const handleCreateFolder = () => {
    const newId = createPlaylist("New Folder", "Organized playlist collection.", undefined, false, true);
    router.push(`/playlist/${newId}`);
  };

  const filteredPlaylists = playlists.filter((p) => {
    if (filterType === "podcasts") return false; // filter out when podcasts tab is active
    if (!librarySearch.trim()) return true;
    return p.name.toLowerCase().includes(librarySearch.toLowerCase());
  });

  return (
    <aside className="w-72 bg-[#121212] flex flex-col h-full border-r border-white/5 hidden md:flex flex-shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-6 pb-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
            <Music className="text-white w-5 h-5 fill-current" />
          </div>
          <span className="text-2xl font-black tracking-tight text-white group-hover:text-primary transition-colors">
            Dhun
          </span>
        </Link>
      </div>

      {/* Main Nav Items */}
      <nav aria-label="Main Navigation" className="px-3 space-y-1">
        {topNavItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-semibold transition-all",
                isActive
                  ? "bg-white/10 text-white font-bold"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive ? "text-primary" : "")} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Your Library Card Dock (Screenshot 1) */}
      <div className="mt-3 flex-1 px-2 flex flex-col min-h-0">
        <div className="bg-[#181818] rounded-2xl flex-1 flex flex-col p-3 border border-white/5 overflow-hidden">
          {/* Library Header */}
          <div className="flex items-center justify-between px-2 py-1">
            <Link
              href="/library"
              className="flex items-center gap-2 text-zinc-400 hover:text-white font-bold text-sm transition-colors group"
            >
              <Library className="w-5 h-5 group-hover:text-white" />
              <span>Your Library</span>
            </Link>

            {/* "+ Create" Dropdown Menu (Screenshot 1) */}
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white text-xs font-bold border border-white/10 hover:border-white/20 transition-all cursor-pointer"
                  title="Create playlist or blend"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create</span>
                </button>
              </DropdownMenu.Trigger>

              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  className="min-w-[260px] bg-[#282828] border border-white/10 rounded-xl p-1.5 shadow-2xl z-50 text-white animate-in fade-in zoom-in-95 duration-100"
                  sideOffset={6}
                  align="end"
                >
                  {/* Playlist Option */}
                  <DropdownMenu.Item
                    onClick={handleCreateNewPlaylist}
                    className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-white/10 cursor-pointer outline-none transition-colors group"
                  >
                    <div className="p-2 rounded-lg bg-white/5 text-zinc-300 group-hover:text-primary group-hover:bg-primary/10">
                      <Music2 className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Playlist</p>
                      <p className="text-[11px] text-zinc-400">Create a playlist with songs or episodes</p>
                    </div>
                  </DropdownMenu.Item>

                  {/* Blend Option */}
                  <DropdownMenu.Item
                    onClick={handleCreateBlend}
                    className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-white/10 cursor-pointer outline-none transition-colors group"
                  >
                    <div className="p-2 rounded-lg bg-white/5 text-zinc-300 group-hover:text-amber-400 group-hover:bg-amber-400/10">
                      <Users2 className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Blend</p>
                      <p className="text-[11px] text-zinc-400">Combine your friends&apos; tastes into a playlist</p>
                    </div>
                  </DropdownMenu.Item>

                  {/* Folder Option */}
                  <DropdownMenu.Item
                    onClick={handleCreateFolder}
                    className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-white/10 cursor-pointer outline-none transition-colors group"
                  >
                    <div className="p-2 rounded-lg bg-white/5 text-zinc-300 group-hover:text-blue-400 group-hover:bg-blue-400/10">
                      <FolderPlus className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Folder</p>
                      <p className="text-[11px] text-zinc-400">Organize your playlists</p>
                    </div>
                  </DropdownMenu.Item>

                  <DropdownMenu.Separator className="h-px bg-white/10 my-1" />

                  {/* Import Option */}
                  <DropdownMenu.Item
                    onClick={() => setIsImportModalOpen(true)}
                    className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-white/10 cursor-pointer outline-none transition-colors group"
                  >
                    <div className="p-2 rounded-lg bg-white/5 text-zinc-300 group-hover:text-emerald-400 group-hover:bg-emerald-400/10">
                      <Upload className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Import Playlist</p>
                      <p className="text-[11px] text-zinc-400">Import from YT Music, Spotify, or CSV</p>
                    </div>
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>

          {/* Filter Pills (Screenshot 1) */}
          <div className="flex items-center gap-1.5 px-2 pt-3 pb-2 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setFilterType(filterType === "playlists" ? "all" : "playlists")}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors",
                filterType === "playlists"
                  ? "bg-white text-black"
                  : "bg-white/5 text-zinc-300 hover:bg-white/10"
              )}
            >
              Playlists
            </button>
            <button
              onClick={() => setFilterType(filterType === "podcasts" ? "all" : "podcasts")}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors",
                filterType === "podcasts"
                  ? "bg-white text-black"
                  : "bg-white/5 text-zinc-300 hover:bg-white/10"
              )}
            >
              Podcasts
            </button>
          </div>

          {/* Library Search Icon & Input */}
          <div className="px-2 py-1.5 flex items-center justify-between">
            {showSearchInput ? (
              <div className="flex items-center gap-1.5 w-full bg-[#242424] px-2.5 py-1 rounded-lg border border-white/10">
                <Search className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search in Library"
                  value={librarySearch}
                  onChange={(e) => setLibrarySearch(e.target.value)}
                  autoFocus
                  className="bg-transparent text-xs text-white placeholder:text-zinc-500 w-full focus:outline-none"
                />
                <button
                  onClick={() => {
                    setLibrarySearch("");
                    setShowSearchInput(false);
                  }}
                  className="text-zinc-400 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowSearchInput(true)}
                className="p-1 text-zinc-400 hover:text-white rounded-md hover:bg-white/5 transition-colors"
                title="Search in Your Library"
              >
                <Search className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Playlists List matching Screenshot 1 */}
          <div className="flex-1 overflow-y-auto space-y-0.5 mt-1 pr-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {filteredPlaylists.map((pl) => {
              const isCurrent = pathname === `/playlist/${pl.id}`;
              return (
                <Link
                  key={pl.id}
                  href={`/playlist/${pl.id}`}
                  className={cn(
                    "flex items-center gap-3 p-2 rounded-xl transition-all group",
                    isCurrent
                      ? "bg-white/15 text-white"
                      : "hover:bg-white/5 text-zinc-300 hover:text-white"
                  )}
                >
                  <div className="w-11 h-11 rounded-lg bg-[#282828] border border-white/5 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {pl.cover ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={pl.cover} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    ) : (
                      <Music className="w-5 h-5 text-zinc-500" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={cn("text-xs font-bold truncate", isCurrent ? "text-primary" : "text-white")}>
                      {pl.name}
                    </p>
                    <p className="text-[11px] text-zinc-400 truncate">
                      {pl.isBlend ? "Blend" : pl.isFolder ? "Folder" : "Playlist"} • {user?.username || "Dhun"}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Import Modal */}
      <PlaylistImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />
    </aside>
  );
}
