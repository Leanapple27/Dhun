"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import SearchResults from "../../components/search/SearchResults";
import { getTrending, searchMusic } from "../../lib/api";
import { Track, usePlayerStore } from "../../stores/playerStore";
import {
  Search,
  Disc3,
  TrendingUp,
  Smile,
  Radio,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { cn } from "../../lib/utils";

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  const [mounted, setMounted] = useState(false);
  const [newReleases, setNewReleases] = useState<Track[]>([]);
  const [topSongs, setTopSongs] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);

  const { play, currentTrack, isPlaying, pause, resume } = usePlayerStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch real releases and top songs
  useEffect(() => {
    let active = true;
    const fetchExploreData = async () => {
      try {
        setLoading(true);
        const [releasesRes, topRes] = await Promise.all([
          getTrending("GLOBAL", "pop"),
          getTrending("IN", "india")
        ]);

        if (active) {
          if (Array.isArray(releasesRes?.data) && releasesRes.data.length > 0) {
            setNewReleases(releasesRes.data.slice(0, 10));
          }
          if (Array.isArray(topRes?.data) && topRes.data.length > 0) {
            setTopSongs(topRes.data.slice(0, 10));
          }
        }
      } catch (err) {
        console.warn("Failed to load live explore charts:", err);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchExploreData();
    return () => {
      active = false;
    };
  }, []);

  const scrollCarousel = (id: string, dir: "left" | "right") => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollBy({ left: dir === "left" ? -400 : 400, behavior: "smooth" });
    }
  };

  if (!mounted) return null;

  return (
    <div className="p-6 md:p-10 min-h-full max-w-7xl mx-auto space-y-10 pb-32">
      {query ? (
        <SearchResults query={query} />
      ) : (
        <div className="space-y-10">
          {/* Top 4 Category Cards (Screenshot 2: New releases, Charts, Moods and genres, Podcasts) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/search?q=New%20Music%20Releases%202025"
              className="bg-[#212121] hover:bg-[#2a2a2a] border border-white/5 hover:border-white/20 p-5 rounded-2xl flex items-center gap-4 transition-all group shadow-md"
            >
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Disc3 className="w-6 h-6 text-zinc-300 group-hover:text-white" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white">New releases</h3>
                <p className="text-[11px] text-zinc-400">Latest singles & albums</p>
              </div>
            </Link>

            <Link
              href="/search?q=Billboard%20Hot%20100%20Chart"
              className="bg-[#212121] hover:bg-[#2a2a2a] border border-white/5 hover:border-white/20 p-5 rounded-2xl flex items-center gap-4 transition-all group shadow-md"
            >
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                <TrendingUp className="w-6 h-6 text-zinc-300 group-hover:text-white" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white">Charts</h3>
                <p className="text-[11px] text-zinc-400">Most played global hits</p>
              </div>
            </Link>

            <Link
              href="/search?q=Chill%20Mood%20Songs"
              className="bg-[#212121] hover:bg-[#2a2a2a] border border-white/5 hover:border-white/20 p-5 rounded-2xl flex items-center gap-4 transition-all group shadow-md"
            >
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Smile className="w-6 h-6 text-zinc-300 group-hover:text-white" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white">Moods and genres</h3>
                <p className="text-[11px] text-zinc-400">Vibe-specific playlists</p>
              </div>
            </Link>

            <Link
              href="/search?q=Top%20Podcasts%20English"
              className="bg-[#212121] hover:bg-[#2a2a2a] border border-white/5 hover:border-white/20 p-5 rounded-2xl flex items-center gap-4 transition-all group shadow-md"
            >
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Radio className="w-6 h-6 text-zinc-300 group-hover:text-white" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white">Podcasts</h3>
                <p className="text-[11px] text-zinc-400">Episodes and shows</p>
              </div>
            </Link>
          </div>

          {/* Section: New albums and singles (Screenshot 2) */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                New albums and singles
              </h2>
              <div className="flex items-center gap-2">
                <Link
                  href="/search?q=New%20Releases%20Albums"
                  className="text-xs font-bold text-zinc-400 hover:text-white px-3 py-1.5 rounded-full hover:bg-white/5 transition-colors"
                >
                  More
                </Link>
                <button
                  onClick={() => scrollCarousel("releases-carousel", "left")}
                  aria-label="Scroll left"
                  className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => scrollCarousel("releases-carousel", "right")}
                  aria-label="Scroll right"
                  className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Horizontal Carousel */}
            <div
              id="releases-carousel"
              className="flex gap-5 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent scroll-smooth"
            >
              {newReleases.map((track) => {
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
                            if (isCurrent && isPlaying) pause();
                            else if (isCurrent) resume();
                            else play(track);
                          }}
                          className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center shadow-2xl hover:scale-110 transition-transform"
                        >
                          {isCurrent && isPlaying ? (
                            <Pause className="w-5 h-5 fill-black" />
                          ) : (
                            <Play className="w-5 h-5 fill-black translate-x-0.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="mt-2.5">
                      <p className={cn("text-xs font-bold truncate", isCurrent ? "text-primary" : "text-white")}>
                        {track.title}
                      </p>
                      <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                        Single • {track.artist}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Section: Top songs (Screenshot 2) */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Top songs
              </h2>
              <Link
                href="/search?q=Top%20Trending%20Songs"
                className="text-xs font-bold text-zinc-400 hover:text-white px-3 py-1.5 rounded-full hover:bg-white/5 transition-colors"
              >
                More
              </Link>
            </div>

            {/* Ranked Songs List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {topSongs.map((track, idx) => {
                const isCurrent = track.id === currentTrack?.id;
                return (
                  <div
                    key={track.id}
                    onClick={() => play(track)}
                    className={cn(
                      "flex items-center gap-3.5 p-2.5 rounded-xl transition-all group cursor-pointer",
                      isCurrent ? "bg-white/10" : "hover:bg-white/5"
                    )}
                  >
                    <span className="w-5 text-center text-xs font-bold text-zinc-400 group-hover:text-white">
                      {idx + 1}
                    </span>

                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#242424] flex-shrink-0 relative shadow-sm">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={track.thumbnail || `https://i.ytimg.com/vi/${track.id}/mqdefault.jpg`}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                      <div
                        className={cn(
                          "absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity",
                          isCurrent ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                        )}
                      >
                        <Play className="w-4 h-4 fill-white text-white" />
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className={cn("text-xs font-bold truncate", isCurrent ? "text-primary" : "text-white")}>
                        {track.title}
                      </p>
                      <p className="text-[11px] text-zinc-400 truncate mt-0.5">{track.artist}</p>
                    </div>

                    <span className="text-[11px] text-zinc-500 font-mono pr-2">
                      {track.duration
                        ? `${Math.floor(track.duration / 60)}:${String(Math.floor(track.duration % 60)).padStart(2, "0")}`
                        : "3:15"}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Browse All Genres Pills & Cards */}
          <section className="space-y-4 pt-4">
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Moods & Genres
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {[
                { name: "Pop", color: "from-pink-600 to-rose-700", query: "Pop Hits" },
                { name: "Hip-Hop", color: "from-amber-600 to-orange-700", query: "Hip Hop Hits" },
                { name: "Rock", color: "from-red-600 to-red-800", query: "Rock Classics" },
                { name: "Electronic", color: "from-cyan-600 to-blue-700", query: "Electronic Dance Music" },
                { name: "Bollywood", color: "from-purple-600 to-indigo-800", query: "Bollywood Hits" },
                { name: "Punjabi", color: "from-teal-600 to-emerald-800", query: "Punjabi Hits" },
                { name: "Indie", color: "from-sky-600 to-blue-800", query: "Indie Pop" },
                { name: "R&B", color: "from-fuchsia-600 to-purple-800", query: "R&B Hits" },
                { name: "Acoustic", color: "from-yellow-600 to-amber-800", query: "Acoustic Chill" },
                { name: "Workout", color: "from-emerald-600 to-green-800", query: "Workout Motivation Music" }
              ].map((genre) => (
                <Link
                  key={genre.name}
                  href={`/search?q=${encodeURIComponent(genre.query)}`}
                  className={cn(
                    "bg-gradient-to-br h-28 rounded-2xl p-4 flex flex-col justify-between hover:scale-[1.03] transition-all shadow-lg border border-white/5",
                    genre.color
                  )}
                >
                  <h3 className="text-base font-bold text-white">{genre.name}</h3>
                  <div className="self-end p-2 rounded-full bg-black/20 text-white/70">
                    <Sparkles className="w-4 h-4" />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-8 text-zinc-400">Loading search...</div>}>
      <SearchContent />
    </Suspense>
  );
}
