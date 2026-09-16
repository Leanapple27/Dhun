"use client";
import { Track } from "../../stores/playerStore";
import { Heart } from "lucide-react";
import { useState } from "react";
import { cn } from "../../lib/utils";

interface NowPlayingProps {
  track: Track;
}

export default function NowPlaying({ track }: NowPlayingProps) {
  const [isLiked, setIsLiked] = useState(false);

  return (
    <div className="flex items-center gap-4 group">
      <div className="w-14 h-14 rounded-md overflow-hidden flex-shrink-0 shadow-md">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={track.thumbnail || "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=150"} 
          alt={track.title} 
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex flex-col min-w-0">
        <h4 className="text-sm font-medium text-white truncate hover:underline cursor-pointer">{track.title}</h4>
        <p className="text-xs text-zinc-400 truncate hover:underline cursor-pointer">{track.artist}</p>
      </div>
      <button 
        onClick={() => setIsLiked(!isLiked)}
        className="ml-2 text-zinc-400 hover:text-white transition-colors"
      >
        <Heart className={cn("w-5 h-5", isLiked && "text-primary fill-primary")} />
      </button>
    </div>
  );
}
