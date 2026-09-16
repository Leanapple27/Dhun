"use client";

import React from "react";
import Link from "next/link";
import { Play, Pause, ArrowUpRight } from "lucide-react";
import { Track, usePlayerStore } from "../../stores/playerStore";
import { cn } from "../../lib/utils";

// 1. Quick Pick Horizontal Card (Screenshot 1 & 2)
interface QuickPickCardProps {
  title: string;
  artist?: string;
  image: string;
  trackQuery: string;
  bgColor?: string;
  customSubtitle?: string;
}

export function SpotifyQuickPickCard({
  title,
  artist,
  image,
  trackQuery,
  bgColor,
  customSubtitle,
}: QuickPickCardProps) {
  const { currentTrack, isPlaying, play, pause } = usePlayerStore();
  const isPlayingThis = isPlaying && currentTrack?.title?.toLowerCase().includes(title.toLowerCase());

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlayingThis) {
      pause();
    } else {
      play({
        id: `qp-${encodeURIComponent(title)}`,
        title: title,
        artist: artist || "Top Artist",
        thumbnail: image,
        duration: 210,
        streamUrl: "",
      });
    }
  };

  return (
    <div
      onClick={handlePlayClick}
      className={cn(
        "group relative flex items-center gap-3 rounded-md overflow-hidden bg-white/5 hover:bg-white/15 transition-all duration-200 cursor-pointer shadow-sm pr-3",
        bgColor
      )}
    >
      <div className="w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0 relative bg-zinc-800">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt={title} className="w-full h-full object-cover" />
      </div>

      <div className="flex-1 min-w-0 pr-2">
        <h4 className="font-bold text-xs sm:text-sm text-white truncate group-hover:text-primary transition-colors">
          {title}
        </h4>
        <p className="text-[11px] text-zinc-400 truncate mt-0.5">
          {customSubtitle || (artist ? `With ${artist}` : "Mix")}
        </p>
      </div>

      <button
        onClick={handlePlayClick}
        aria-label={`Play ${title}`}
        className={cn(
          "w-10 h-10 rounded-full bg-[#1ed760] hover:bg-[#20e266] text-black flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-200 hover:scale-105 flex-shrink-0",
          isPlayingThis && "opacity-100 translate-y-0"
        )}
      >
        {isPlayingThis ? (
          <Pause className="w-5 h-5 fill-black" />
        ) : (
          <Play className="w-5 h-5 fill-black ml-0.5" />
        )}
      </button>
    </div>
  );
}

// 2. Spotify Artist Radio Card (Screenshot 2 & 4)
interface SpotifyRadioCardProps {
  artistName: string;
  subtitle: string;
  bgHex: string;
  textColorHex?: string;
  artistImages: string[];
}

export function SpotifyRadioCard({
  artistName,
  subtitle,
  bgHex,
  textColorHex = "#000000",
  artistImages,
}: SpotifyRadioCardProps) {
  const { play } = usePlayerStore();

  const handlePlay = () => {
    play({
      id: `radio-${encodeURIComponent(artistName)}`,
      title: `${artistName} Radio`,
      artist: artistName,
      thumbnail: artistImages[0] || "",
      duration: 215,
      streamUrl: "",
    });
  };

  return (
    <div
      onClick={handlePlay}
      className="p-4 rounded-lg bg-[#181818]/60 hover:bg-[#282828] transition-all duration-300 group cursor-pointer w-44 sm:w-48 flex-shrink-0 flex flex-col justify-between relative"
    >
      {/* Artwork container with Radio styling */}
      <div
        className="w-full aspect-square rounded-md p-3 relative overflow-hidden shadow-lg flex flex-col justify-between mb-3"
        style={{ backgroundColor: bgHex }}
      >
        {/* Top Radio Badge */}
        <div className="flex items-center justify-between">
          <span
            className="text-[10px] font-black tracking-widest uppercase opacity-85"
            style={{ color: textColorHex }}
          >
            Radio
          </span>
          <div className="flex items-center gap-0.5">
            <span className="w-1 h-3 rounded-full bg-current opacity-80" style={{ color: textColorHex }} />
            <span className="w-1 h-2 rounded-full bg-current opacity-60" style={{ color: textColorHex }} />
            <span className="w-1 h-4 rounded-full bg-current opacity-90" style={{ color: textColorHex }} />
          </div>
        </div>

        {/* Center circular artist cutouts */}
        <div className="flex items-center justify-center -space-x-3 my-auto py-2">
          {artistImages.slice(0, 3).map((img, idx) => (
            <div
              key={idx}
              className={cn(
                "rounded-full overflow-hidden border-2 border-white/20 shadow-md bg-zinc-800",
                idx === 1 ? "w-14 h-14 z-10 scale-110" : "w-11 h-11 z-0 opacity-90"
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img} alt={artistName} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>

        {/* Bottom Title inside card */}
        <h4
          className="font-black text-base sm:text-lg tracking-tight truncate"
          style={{ color: textColorHex }}
        >
          {artistName}
        </h4>

        {/* Hover green play button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handlePlay();
          }}
          className="absolute bottom-2 right-2 w-11 h-11 rounded-full bg-[#1ed760] hover:bg-[#20e266] text-black flex items-center justify-center shadow-2xl opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:scale-105 z-20"
        >
          <Play className="w-5 h-5 fill-black ml-0.5" />
        </button>
      </div>

      {/* Description below card */}
      <h5 className="font-bold text-sm text-white truncate">{artistName} Radio</h5>
      <p className="text-xs text-zinc-400 line-clamp-2 mt-1 leading-snug">{subtitle}</p>
    </div>
  );
}

// 3. Spotify Daylist Card (Screenshot 2)
export function SpotifyDaylistCard() {
  const { play } = usePlayerStore();

  const handlePlay = () => {
    play({
      id: "daylist-mix",
      title: "daylist • afternoon beats",
      artist: "Dhun Algorithm",
      thumbnail: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400",
      duration: 195,
      streamUrl: "",
    });
  };

  return (
    <div
      onClick={handlePlay}
      className="p-4 rounded-lg bg-[#181818]/60 hover:bg-[#282828] transition-all duration-300 group cursor-pointer w-44 sm:w-48 flex-shrink-0 flex flex-col justify-between relative"
    >
      <div className="w-full aspect-square rounded-md p-4 relative overflow-hidden shadow-lg mb-3 bg-gradient-to-tr from-amber-400 via-emerald-400 to-sky-500 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-black/70 bg-white/40 px-1.5 py-0.5 rounded">
            Personalized
          </span>
        </div>

        {/* Big subtle sunburst circle */}
        <div className="absolute inset-4 rounded-full bg-white/30 blur-xl pointer-events-none" />

        {/* Daylist Logo / Text */}
        <div className="relative z-10">
          <span className="font-black text-2xl tracking-tighter text-black lowercase block leading-none">
            daylist
          </span>
          <span className="text-[10px] font-bold text-black/70 mt-1 block">
            updates frequently
          </span>
        </div>

        {/* Hover green play button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handlePlay();
          }}
          className="absolute bottom-2 right-2 w-11 h-11 rounded-full bg-[#1ed760] hover:bg-[#20e266] text-black flex items-center justify-center shadow-2xl opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:scale-105 z-20"
        >
          <Play className="w-5 h-5 fill-black ml-0.5" />
        </button>
      </div>

      <h5 className="font-bold text-sm text-white truncate">daylist</h5>
      <p className="text-xs text-zinc-400 line-clamp-2 mt-1 leading-snug">
        Here&apos;s some international, pop, melodic acoustic afternoon vibes...
      </p>
    </div>
  );
}

// 4. Spotify Featured Chart Card (Screenshot 1)
interface SpotifyChartCardProps {
  title: string;
  country: string;
  gradientClass: string;
  typeBadge: "Weekly Music Charts" | "Top 50";
  subtitle: string;
}

export function SpotifyChartCard({
  title,
  country,
  gradientClass,
  typeBadge,
  subtitle,
}: SpotifyChartCardProps) {
  const { play } = usePlayerStore();

  const handlePlay = () => {
    play({
      id: `chart-${encodeURIComponent(title)}`,
      title: `${title} - ${country}`,
      artist: "Charts Global",
      thumbnail: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400",
      duration: 180,
      streamUrl: "",
    });
  };

  return (
    <div
      onClick={handlePlay}
      className="p-4 rounded-lg bg-[#181818]/60 hover:bg-[#282828] transition-all duration-300 group cursor-pointer w-44 sm:w-48 flex-shrink-0 flex flex-col justify-between relative"
    >
      <div
        className={cn(
          "w-full aspect-square rounded-md p-4 relative overflow-hidden shadow-xl flex flex-col justify-between mb-3",
          gradientClass
        )}
      >
        {/* Top branding */}
        <div className="flex items-center justify-between">
          <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-white text-[10px] font-black">
            ●
          </div>
        </div>

        {/* Main Title Typography */}
        {typeBadge === "Weekly Music Charts" ? (
          <div>
            <span className="block text-xl sm:text-2xl font-black text-white leading-none tracking-tight">
              {title}
            </span>
            <span className="block text-base sm:text-lg font-bold text-white/90 tracking-tight">
              {country}
            </span>
          </div>
        ) : (
          <div className="text-center my-auto">
            <span className="block text-2xl sm:text-3xl font-black text-white leading-none">
              Top 50
            </span>
            <div className="w-12 h-0.5 bg-white/30 mx-auto my-1.5" />
            <span className="block text-[11px] font-black uppercase tracking-widest text-white/90">
              {country}
            </span>
          </div>
        )}

        {/* Bottom Badge or Icon */}
        {typeBadge === "Weekly Music Charts" && (
          <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm text-black px-2 py-0.5 rounded text-[9px] font-bold self-start">
            <ArrowUpRight className="w-3 h-3 stroke-[3]" />
            <span>Weekly Music Charts</span>
          </div>
        )}

        {/* Hover green play button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handlePlay();
          }}
          className="absolute bottom-2 right-2 w-11 h-11 rounded-full bg-[#1ed760] hover:bg-[#20e266] text-black flex items-center justify-center shadow-2xl opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:scale-105 z-20"
        >
          <Play className="w-5 h-5 fill-black ml-0.5" />
        </button>
      </div>

      <h5 className="font-bold text-sm text-white truncate">
        {title} {country}
      </h5>
      <p className="text-xs text-zinc-400 line-clamp-2 mt-1 leading-snug">{subtitle}</p>
    </div>
  );
}

// 5. Spotify Standard Square Card (Screenshots 3, 4, 5)
interface SpotifySquareCardProps {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  albumId?: string;
  showSpotifyLogo?: boolean;
}

export function SpotifySquareCard({
  id,
  title,
  subtitle,
  image,
  albumId,
  showSpotifyLogo,
}: SpotifySquareCardProps) {
  const { play } = usePlayerStore();

  const handlePlay = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    play({
      id: id,
      title: title,
      artist: subtitle,
      thumbnail: image,
      duration: 220,
      streamUrl: "",
    });
  };

  const CardWrapper = albumId
    ? ({ children }: { children: React.ReactNode }) => (
        <Link
          href={`/album/${encodeURIComponent(albumId)}?title=${encodeURIComponent(title)}&artist=${encodeURIComponent(subtitle)}`}
          className="p-4 rounded-lg bg-[#181818]/60 hover:bg-[#282828] transition-all duration-300 group cursor-pointer w-44 sm:w-48 flex-shrink-0 flex flex-col justify-between relative block"
        >
          {children}
        </Link>
      )
    : ({ children }: { children: React.ReactNode }) => (
        <div
          onClick={handlePlay}
          className="p-4 rounded-lg bg-[#181818]/60 hover:bg-[#282828] transition-all duration-300 group cursor-pointer w-44 sm:w-48 flex-shrink-0 flex flex-col justify-between relative"
        >
          {children}
        </div>
      );

  return (
    <CardWrapper>
      <div className="relative w-full aspect-square rounded-md overflow-hidden shadow-lg mb-3 bg-zinc-900">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {showSpotifyLogo && (
          <div className="absolute top-2 left-2 w-4 h-4 rounded-full bg-black/60 flex items-center justify-center text-[10px] text-white">
            ●
          </div>
        )}

        {/* Hover green play button */}
        <button
          onClick={handlePlay}
          className="absolute bottom-2 right-2 w-11 h-11 rounded-full bg-[#1ed760] hover:bg-[#20e266] text-black flex items-center justify-center shadow-2xl opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:scale-105 z-20"
        >
          <Play className="w-5 h-5 fill-black ml-0.5" />
        </button>
      </div>

      <h5 className="font-bold text-sm text-white truncate group-hover:text-primary transition-colors">
        {title}
      </h5>
      <p className="text-xs text-zinc-400 line-clamp-2 mt-1 leading-snug">{subtitle}</p>
    </CardWrapper>
  );
}

// 6. Spotify Artist Circle Card (Screenshot 5)
interface SpotifyArtistCircleCardProps {
  name: string;
  image: string;
  role?: string;
}

export function SpotifyArtistCircleCard({
  name,
  image,
  role = "Artist",
}: SpotifyArtistCircleCardProps) {
  const { play } = usePlayerStore();

  const handlePlay = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    play({
      id: `artist-${encodeURIComponent(name)}`,
      title: `${name} Best Hits`,
      artist: name,
      thumbnail: image,
      duration: 210,
      streamUrl: "",
    });
  };

  return (
    <Link
      href={`/artist/${encodeURIComponent(name)}`}
      className="p-4 rounded-lg bg-[#181818]/60 hover:bg-[#282828] transition-all duration-300 group cursor-pointer w-44 sm:w-48 flex-shrink-0 flex flex-col items-start relative block"
    >
      <div className="relative w-full aspect-square rounded-full overflow-hidden shadow-xl mb-3 bg-zinc-900 mx-auto">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Hover green play button */}
        <button
          onClick={handlePlay}
          className="absolute bottom-2 right-2 w-11 h-11 rounded-full bg-[#1ed760] hover:bg-[#20e266] text-black flex items-center justify-center shadow-2xl opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:scale-105 z-20"
        >
          <Play className="w-5 h-5 fill-black ml-0.5" />
        </button>
      </div>

      <h5 className="font-bold text-sm text-white truncate w-full group-hover:text-primary transition-colors">
        {name}
      </h5>
      <p className="text-xs text-zinc-400 capitalize mt-0.5">{role}</p>
    </Link>
  );
}
