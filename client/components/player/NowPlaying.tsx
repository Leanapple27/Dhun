"use client";
import { Track, usePlayerStore } from "../../stores/playerStore";
import { Heart, Maximize2 } from "lucide-react";
import { useState } from "react";
import { cn } from "../../lib/utils";

interface NowPlayingProps {
  track: Track;
}

export default function NowPlaying({ track }: NowPlayingProps) {
  const [isLiked, setIsLiked] = useState(false);
  const openNowPlayingWindow = usePlayerStore((s) => s.openNowPlayingWindow);

  return (
    <div className="flex items-center gap-3.5 group">
      {/* Clickable Album Art with Expand overlay */}
      <button
        onClick={openNowPlayingWindow}
        title="Expand Now Playing Window"
        aria-label="Expand Now Playing Window"
        className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 shadow-md relative group/cover cursor-pointer border border-white/5"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={track.thumbnail || `https://i.ytimg.com/vi/${track.id}/hqdefault.jpg`} 
          alt={track.title} 
          className="w-full h-full object-cover group-hover/cover:scale-105 transition-transform"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/cover:opacity-100 flex items-center justify-center transition-opacity">
          <Maximize2 className="w-4 h-4 text-white drop-shadow-md" />
        </div>
      </button>

      {/* Clickable Track Info */}
      <div 
        onClick={openNowPlayingWindow}
        className="flex flex-col min-w-0 cursor-pointer"
        title="Open Now Playing"
      >
        <h4 className="text-sm font-semibold text-white truncate hover:underline">{track.title}</h4>
        <p className="text-xs text-zinc-400 truncate hover:underline">{track.artist}</p>
      </div>

      <button 
        onClick={() => setIsLiked(!isLiked)}
        aria-label={isLiked ? "Unlike song" : "Like song"}
        className="ml-1 p-1 text-zinc-400 hover:text-white transition-colors cursor-pointer"
      >
        <Heart className={cn("w-4 h-4", isLiked && "text-primary fill-primary")} />
      </button>
    </div>
  );
}
