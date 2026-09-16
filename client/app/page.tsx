"use client";

import { useEffect, useState, useRef } from "react";
import { Track, usePlayerStore } from "../stores/playerStore";
import { getTrending, searchMusic } from "../lib/api";
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  ThumbsUp,
  MoreVertical,
  Radio,
  Sparkles,
  Flame,
  Volume2
} from "lucide-react";
import { cn } from "../lib/utils";
import Link from "next/link";

// Authentic YouTube Music default quick picks with real YouTube IDs and covers
const INITIAL_QUICK_PICKS: Track[] = [
  {
    id: "m4_9Wy4547g",
    title: "Paint The Town Red",
    artist: "Doja Cat",
    thumbnail: "https://i.ytimg.com/vi/m4_9Wy4547g/hqdefault.jpg",
    duration: 231,
    album: "Scarlet"
  },
  {
    id: "DCEVC_sr5Go",
    title: "telepatía",
    artist: "Kali Uchis",
    thumbnail: "https://i.ytimg.com/vi/DCEVC_sr5Go/hqdefault.jpg",
    duration: 160,
    album: "Sin Miedo"
  },
  {
    id: "ekr2nIex040",
    title: "APT.",
    artist: "ROSÉ & Bruno Mars",
    thumbnail: "https://i.ytimg.com/vi/ekr2nIex040/hqdefault.jpg",
    duration: 174,
    album: "rosie"
  },
  {
    id: "4NRXx6U8ABQ",
    title: "Blinding Lights",
    artist: "The Weeknd",
    thumbnail: "https://i.ytimg.com/vi/4NRXx6U8ABQ/hqdefault.jpg",
    duration: 200,
    album: "After Hours"
  },
  {
    id: "sVty_SCAYZs",
    title: "The Less I Know The Better",
    artist: "Tame Impala",
    thumbnail: "https://i.ytimg.com/vi/sVty_SCAYZs/hqdefault.jpg",
    duration: 216,
    album: "Currents"
  },
  {
    id: "bpOSxM0rNPM",
    title: "Do I Wanna Know?",
    artist: "Arctic Monkeys",
    thumbnail: "https://i.ytimg.com/vi/bpOSxM0rNPM/hqdefault.jpg",
    duration: 272,
    album: "AM"
  },
  {
    id: "B5YNiCfWC3A",
    title: "Swimming Pools (Drank)",
    artist: "Kendrick Lamar",
    thumbnail: "https://i.ytimg.com/vi/B5YNiCfWC3A/hqdefault.jpg",
    duration: 247,
    album: "good kid, m.A.A.d city"
  },
  {
    id: "m7Bc3pLyij0",
    title: "Snooze",
    artist: "SZA",
    thumbnail: "https://i.ytimg.com/vi/m7Bc3pLyij0/hqdefault.jpg",
    duration: 201,
    album: "SOS"
  },
  {
    id: "kJQP7kiw5Fk",
    title: "Despacito",
    artist: "Luis Fonsi, Daddy Yankee",
    thumbnail: "https://i.ytimg.com/vi/kJQP7kiw5Fk/hqdefault.jpg",
    duration: 228,
    album: "VIDA"
  },
  {
    id: "pAgnJzSD4VA",
    title: "Stressed Out",
    artist: "Twenty One Pilots",
    thumbnail: "https://i.ytimg.com/vi/pAgnJzSD4VA/hqdefault.jpg",
    duration: 202,
    album: "Blurryface"
  },
  {
    id: "2Vv-BfVoq4g",
    title: "Perfect",
    artist: "Ed Sheeran",
    thumbnail: "https://i.ytimg.com/vi/2Vv-BfVoq4g/hqdefault.jpg",
    duration: 263,
    album: "Divide"
  },
  {
    id: "fJ9rUzIMcZQ",
    title: "Bohemian Rhapsody",
    artist: "Queen",
    thumbnail: "https://i.ytimg.com/vi/fJ9rUzIMcZQ/hqdefault.jpg",
    duration: 359,
    album: "A Night at the Opera"
  },
  {
    id: "NJAv_7lHUIU",
    title: "Kesariya",
    artist: "Arijit Singh, Pritam",
    thumbnail: "https://i.ytimg.com/vi/NJAv_7lHUIU/hqdefault.jpg",
    duration: 268,
    album: "Brahmastra"
  },
  {
    id: "Wqu4MRQOgyo",
    title: "Dhun (Saiyaara)",
    artist: "Arijit Singh",
    thumbnail: "https://i.ytimg.com/vi/Wqu4MRQOgyo/hqdefault.jpg",
    duration: 277,
    album: "Dhun Exclusive"
  },
  {
    id: "YALvuUpY_b0",
    title: "Apna Bana Le",
    artist: "Arijit Singh, Sachin-Jigar",
    thumbnail: "https://i.ytimg.com/vi/YALvuUpY_b0/hqdefault.jpg",
    duration: 262,
    album: "Bhediya"
  },
  {
    id: "G8tHzcK7_h4",
    title: "Starboy",
    artist: "The Weeknd, Daft Punk",
    thumbnail: "https://i.ytimg.com/vi/G8tHzcK7_h4/hqdefault.jpg",
    duration: 230,
    album: "Starboy"
  }
];

export default function Home() {
  const [quickPicks, setQuickPicks] = useState<Track[]>(INITIAL_QUICK_PICKS);
  const [trendingRow, setTrendingRow] = useState<Track[]>([]);
  const [similarArtistTracks, setSimilarArtistTracks] = useState<Track[]>([]);
  const [mediaType, setMediaType] = useState<"all" | "music" | "podcasts">("all");

  const {
    play,
    currentTrack,
    isPlaying,
    pause,
    resume,
    seek,
    currentTime,
    duration,
    toggleMute,
    next,
    previous,
    openNowPlayingWindow
  } = usePlayerStore();

  // Scroll helpers
  const scrollRow = (id: string, dir: "left" | "right") => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollBy({ left: dir === "left" ? -440 : 440, behavior: "smooth" });
    }
  };

  // Live data fetching
  useEffect(() => {
    let active = true;

    const loadData = async () => {
      try {
        const [trendRes, similarRes] = await Promise.all([
          getTrending("IN", "india"),
          searchMusic("Twenty One Pilots", "music_songs")
        ]);

        if (active) {
          if (Array.isArray(trendRes?.data) && trendRes.data.length > 0) {
            setTrendingRow(trendRes.data.slice(0, 12));
            // Mix trending with initial picks
            setQuickPicks((prev) => {
              const merged = [...trendRes.data.slice(0, 8), ...prev.slice(8, 16)];
              return merged;
            });
          }

          if (Array.isArray(similarRes?.data) && similarRes.data.length > 0) {
            setSimilarArtistTracks(similarRes.data.slice(0, 10));
          }
        }
      } catch (err) {
        console.warn("Using offline music catalog for Home:", err);
      }
    };

    loadData();
    return () => {
      active = false;
    };
  }, []);

  // Global Keyboard Shortcuts (Space, Left/Right, Shift+Left/Right, M, F)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || target?.isContentEditable) {
        return;
      }

      if (e.code === "Space") {
        e.preventDefault();
        if (isPlaying) pause();
        else resume();
      } else if (e.code === "ArrowRight" && !e.shiftKey) {
        e.preventDefault();
        seek(Math.min(duration, currentTime + 5));
      } else if (e.code === "ArrowLeft" && !e.shiftKey) {
        e.preventDefault();
        seek(Math.max(0, currentTime - 5));
      } else if (e.code === "ArrowRight" && e.shiftKey) {
        e.preventDefault();
        next();
      } else if (e.code === "ArrowLeft" && e.shiftKey) {
        e.preventDefault();
        previous();
      } else if (e.key === "m" || e.key === "M") {
        e.preventDefault();
        toggleMute();
      } else if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        openNowPlayingWindow();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying, pause, resume, seek, currentTime, duration, next, previous, toggleMute, openNowPlayingWindow]);

  const handlePlayAll = () => {
    if (quickPicks.length > 0) {
      play(quickPicks[0]);
    }
  };

  return (
    <div className="min-h-full bg-[#030303] text-white pb-32">
      {/* Top Ambient Glow Reacting to Current Track */}
      <div className="relative px-6 md:px-10 pt-6 pb-4">
        {/* Filter Pills (All / Music / Podcasts) */}
        <div className="flex items-center gap-2 mb-8">
          {(["all", "music", "podcasts"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setMediaType(type)}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs font-bold capitalize transition-all cursor-pointer",
                mediaType === type
                  ? "bg-white text-black shadow-md scale-105"
                  : "bg-white/10 text-white hover:bg-white/20"
              )}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Section: Quick picks (Screenshot 4) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Quick picks
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePlayAll}
                className="px-4 py-1.5 rounded-full border border-white/15 hover:border-white text-xs font-bold text-white hover:bg-white/10 transition-all cursor-pointer"
              >
                Play all
              </button>

              <button
                onClick={() => scrollRow("quick-picks-grid", "left")}
                aria-label="Previous picks"
                className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                onClick={() => scrollRow("quick-picks-grid", "right")}
                aria-label="Next picks"
                className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 4-Row Column Matrix Grid (Screenshot 4) */}
          <div
            id="quick-picks-grid"
            className="grid grid-flow-col grid-rows-4 gap-x-6 gap-y-2 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-white/10 scroll-smooth"
            style={{ gridAutoColumns: "minmax(280px, 340px)" }}
          >
            {quickPicks.map((track) => {
              const isCurrent = track.id === currentTrack?.id;
              return (
                <div
                  key={track.id}
                  onClick={() => play(track)}
                  className={cn(
                    "flex items-center gap-3.5 p-2 rounded-xl transition-all group cursor-pointer border border-transparent",
                    isCurrent
                      ? "bg-white/15 border-white/10 shadow-md"
                      : "hover:bg-white/5"
                  )}
                >
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#242424] flex-shrink-0 relative shadow-sm border border-white/5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={track.thumbnail || `https://i.ytimg.com/vi/${track.id}/hqdefault.jpg`}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    <div
                      className={cn(
                        "absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity",
                        isCurrent ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                      )}
                    >
                      {isCurrent && isPlaying ? (
                        <Pause className="w-4 h-4 fill-white text-white" />
                      ) : (
                        <Play className="w-4 h-4 fill-white text-white" />
                      )}
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className={cn("text-xs sm:text-sm font-bold truncate", isCurrent ? "text-primary" : "text-white")}>
                      {track.title}
                    </p>
                    <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                      {track.artist} {track.album ? `• ${track.album}` : ""}
                    </p>
                  </div>

                  {/* Inline Action Controls on Hover (Screenshot 4) */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // quick like toggle
                      }}
                      aria-label="Thumbs up"
                      className="p-1.5 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openNowPlayingWindow();
                      }}
                      aria-label="More options"
                      className="p-1.5 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white"
                    >
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Section: SIMILAR TO Twenty One Pilots (Screenshot 4) */}
        <section className="space-y-4 pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full overflow-hidden border border-white/10 bg-[#242424]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://i.ytimg.com/vi/pAgnJzSD4VA/hqdefault.jpg"
                  alt="Twenty One Pilots"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">Similar to</p>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  Twenty One Pilots
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => scrollRow("similar-artists-row", "left")}
                aria-label="Scroll left"
                className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scrollRow("similar-artists-row", "right")}
                aria-label="Scroll right"
                className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Carousel */}
          <div
            id="similar-artists-row"
            className="flex gap-5 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-white/10 scroll-smooth"
          >
            {(similarArtistTracks.length > 0 ? similarArtistTracks : quickPicks.slice(4, 12)).map((track) => {
              const isCurrent = track.id === currentTrack?.id;
              return (
                <div
                  key={track.id}
                  onClick={() => play(track)}
                  className="w-[180px] sm:w-[200px] flex-shrink-0 group cursor-pointer"
                >
                  <div className="w-full aspect-square rounded-2xl overflow-hidden bg-[#242424] relative shadow-lg border border-white/5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={track.thumbnail || `https://i.ytimg.com/vi/${track.id}/hqdefault.jpg`}
                      alt={track.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div
                      className={cn(
                        "absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity",
                        isCurrent ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                      )}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          play(track);
                        }}
                        className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center shadow-2xl hover:scale-110 transition-transform"
                      >
                        <Play className="w-5 h-5 fill-black translate-x-0.5" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-2.5">
                    <p className={cn("text-xs font-bold truncate", isCurrent ? "text-primary" : "text-white")}>
                      {track.title}
                    </p>
                    <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                      Album • {track.artist}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Section: Trending Hits */}
        {trendingRow.length > 0 && (
          <section className="space-y-4 pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-500" />
                <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  Trending Hits
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => scrollRow("trending-hits-row", "left")}
                  aria-label="Scroll left"
                  className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => scrollRow("trending-hits-row", "right")}
                  aria-label="Scroll right"
                  className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div
              id="trending-hits-row"
              className="flex gap-5 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-white/10 scroll-smooth"
            >
              {trendingRow.map((track) => {
                const isCurrent = track.id === currentTrack?.id;
                return (
                  <div
                    key={track.id}
                    onClick={() => play(track)}
                    className="w-[170px] sm:w-[190px] flex-shrink-0 group cursor-pointer"
                  >
                    <div className="w-full aspect-square rounded-2xl overflow-hidden bg-[#242424] relative shadow-lg border border-white/5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={track.thumbnail || `https://i.ytimg.com/vi/${track.id}/hqdefault.jpg`}
                        alt={track.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div
                        className={cn(
                          "absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity",
                          isCurrent ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                        )}
                      >
                        <Play className="w-5 h-5 fill-white text-white" />
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className={cn("text-xs font-bold truncate", isCurrent ? "text-primary" : "text-white")}>
                        {track.title}
                      </p>
                      <p className="text-[11px] text-zinc-400 truncate mt-0.5">{track.artist}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
