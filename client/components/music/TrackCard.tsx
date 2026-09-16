"use client";
import { Track, usePlayerStore } from "../../stores/playerStore";
import { Play, Pause } from "lucide-react";
import { cn } from "../../lib/utils";

interface TrackCardProps {
  track: Track;
}

export default function TrackCard({ track }: TrackCardProps) {
  const { currentTrack, isPlaying, play, pause } = usePlayerStore();
  const isCurrentTrack = currentTrack?.id === track.id;

  const handlePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrentTrack && isPlaying) {
      pause();
    } else {
      play(track);
    }
  };

  return (
    <div 
      className="bg-surface p-4 rounded-xl hover:bg-surface-hover transition-colors group cursor-pointer w-48 flex-shrink-0"
      onClick={() => play(track)}
    >
      <div className="relative w-full aspect-square mb-4 rounded-lg overflow-hidden shadow-lg">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={track.thumbnail} 
          alt={track.title} 
          className="w-full h-full object-cover"
        />
        <button 
          onClick={handlePlayPause}
          className={cn(
            "absolute bottom-2 right-2 w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white shadow-xl transition-all transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 hover:scale-105",
            isCurrentTrack && "translate-y-0 opacity-100"
          )}
        >
          {isCurrentTrack && isPlaying ? (
            <Pause className="w-6 h-6 fill-current" />
          ) : (
            <Play className="w-6 h-6 fill-current ml-1" />
          )}
        </button>
      </div>
      <h3 className="font-semibold text-white truncate text-base mb-1">{track.title}</h3>
      <p className="text-sm text-zinc-400 truncate">{track.artist}</p>
    </div>
  );
}
