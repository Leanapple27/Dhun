"use client";
import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, User, LogOut, LogIn, Library, Sparkles, TrendingUp, X, Home, Bell, Users, Compass } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import ThemeToggle from "../common/ThemeToggle";
import { debounce } from "../../lib/utils";
import { useAuthStore } from "../../stores/authStore";
import { getSearchSuggestions } from "../../lib/api";
import AuthModal from "../auth/AuthModal";

export default function TopBar() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { user, logout, loadUser } = useAuthStore();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"login" | "register">("login");

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const fetchSuggestions = useCallback(
    debounce(async (val: string) => {
      if (val.trim().length > 1) {
        const results = await getSearchSuggestions(val);
        setSuggestions(results);
        setShowSuggestions(results.length > 0);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 200),
    []
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setActiveIndex(-1);
    fetchSuggestions(val);
  };

  const handleSelectSuggestion = (text: string) => {
    setQuery(text);
    setShowSuggestions(false);
    router.push(`/search?q=${encodeURIComponent(text)}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (suggestions.length > 0) {
        setActiveIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (suggestions.length > 0) {
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
      setShowSuggestions(false);
      const targetQuery = activeIndex >= 0 && suggestions[activeIndex] ? suggestions[activeIndex] : query;
      if (targetQuery.trim()) {
        router.push(`/search?q=${encodeURIComponent(targetQuery.trim())}`);
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="h-16 flex items-center justify-between px-6 bg-[#09090b]/90 backdrop-blur-md sticky top-0 z-40 gap-4">
      {/* Center/Left Search Section */}
      <div className="flex items-center gap-2 flex-1 max-w-lg">
        {/* Home Button */}
        <button
          onClick={() => router.push("/")}
          aria-label="Home"
          className="w-10 h-10 rounded-full bg-[#1f1f1f] hover:bg-[#282828] hover:scale-105 flex items-center justify-center text-white transition-all flex-shrink-0"
          title="Home"
        >
          <Home className="w-5 h-5 fill-white" />
        </button>

        <div ref={searchContainerRef} className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 z-10" />
          <input
            type="text"
            placeholder="What do you want to play?"
            aria-label="Search songs, albums, artists, or podcasts"
            value={query}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (suggestions.length > 0) setShowSuggestions(true);
            }}
            className="w-full bg-[#1f1f1f] hover:bg-[#282828] border border-transparent focus:border-white/20 rounded-full py-2.5 pl-10 pr-10 text-sm focus:outline-none text-white placeholder:text-zinc-400 transition-all shadow-inner"
          />

          {query ? (
            <button
              onClick={() => {
                setQuery("");
                setSuggestions([]);
                setShowSuggestions(false);
              }}
              aria-label="Clear search input"
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => router.push("/search")}
              aria-label="Browse music catalog"
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white border-l border-white/10 pl-2"
              title="Browse"
            >
              <Compass className="w-4 h-4" />
            </button>
          )}

          {/* Autocomplete Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-[#18181b]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100 divide-y divide-white/5">
              {suggestions.map((item, idx) => (
                <button
                  key={item}
                  onClick={() => handleSelectSuggestion(item)}
                  onMouseEnter={() => setActiveIndex(idx)}
                  className={`w-full text-left px-4 py-2.5 flex items-center gap-3 text-xs sm:text-sm transition-colors cursor-pointer ${
                    activeIndex === idx ? "bg-white/15 text-white" : "text-zinc-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <TrendingUp className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="truncate">{item}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Action Icons & Profile */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push("/search")}
          aria-label="Notifications"
          className="w-9 h-9 rounded-full hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
        </button>

        <button
          onClick={() => router.push("/library")}
          aria-label="Friends Activity"
          className="w-9 h-9 rounded-full hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
          title="Friends Activity"
        >
          <Users className="w-4 h-4" />
        </button>

        <ThemeToggle />

        {user ? (
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button 
                aria-label={`Account menu for ${user.username}`}
                className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-sm flex items-center justify-center hover:scale-105 transition-all cursor-pointer shadow-md overflow-hidden border border-white/20"
                title={`Account (${user.username})`}
              >
                {user.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                ) : (
                  <span>{user.username ? user.username.charAt(0).toUpperCase() : "U"}</span>
                )}
              </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="min-w-[210px] bg-[#18181b] border border-white/10 rounded-2xl p-1.5 shadow-2xl z-50 text-sm animate-in fade-in zoom-in-95 duration-100"
                sideOffset={8}
                align="end"
              >
                <div className="px-3 py-2 border-b border-white/5 mb-1">
                  <p className="text-xs font-semibold text-white truncate">
                    {user.username}
                  </p>
                  <p className="text-[11px] text-zinc-400 truncate">
                    {user.email}
                  </p>
                </div>

                <DropdownMenu.Item
                  onClick={() => router.push("/profile")}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs text-zinc-200 hover:text-white hover:bg-white/10 rounded-xl cursor-pointer outline-none transition-colors"
                >
                  <User className="w-4 h-4 text-primary" />
                  Profile & Settings
                </DropdownMenu.Item>

                <DropdownMenu.Item
                  onClick={() => router.push("/library")}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs text-zinc-200 hover:text-white hover:bg-white/10 rounded-xl cursor-pointer outline-none transition-colors"
                >
                  <Library className="w-4 h-4 text-amber-400" />
                  My Library
                </DropdownMenu.Item>

                <DropdownMenu.Item
                  onClick={() => router.push("/speed-dial")}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs text-zinc-200 hover:text-white hover:bg-white/10 rounded-xl cursor-pointer outline-none transition-colors"
                >
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  Speed Dial (1-9)
                </DropdownMenu.Item>

                <DropdownMenu.Separator className="h-px bg-white/5 my-1" />

                <DropdownMenu.Item
                  onClick={logout}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 rounded-xl cursor-pointer outline-none transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setAuthModalMode("register");
                setAuthModalOpen(true);
              }}
              className="text-zinc-300 hover:text-white font-bold text-xs sm:text-sm px-3 py-1.5 rounded-full hover:scale-105 transition-all cursor-pointer whitespace-nowrap"
            >
              Sign up
            </button>
            <button
              onClick={() => {
                setAuthModalMode("login");
                setAuthModalOpen(true);
              }}
              className="bg-white hover:bg-zinc-100 text-black font-bold text-xs sm:text-sm px-5 py-2 rounded-full hover:scale-105 transition-all shadow-md cursor-pointer whitespace-nowrap"
            >
              Log in
            </button>
          </div>
        )}
      </div>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
      />
    </header>
  );
}
