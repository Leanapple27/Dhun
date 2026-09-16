"use client";
import { usePlayerStore } from "../../stores/playerStore";
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1 } from "lucide-react";
import { cn } from "../../lib/utils";

export default function PlayerControls() {
  const { 
    isPlaying, 
    play, 
    pause, 
    resume, 
    next, 
    previous, 
    shuffleEnabled, 
    repeatMode, 
    toggleShuffle, 
    toggleRepeat,
    currentTrack
  } = usePlayerStore();

  const handlePlayPause = () => {
    if (isPlaying) {
      pause();
    } else if (currentTrack) {
      resume();
    } else {
      play();
    }
  };

  return (
    <div className="flex items-center gap-6" role="group" aria-label="Playback controls">
      <button 
        onClick={toggleShuffle}
        aria-label={shuffleEnabled ? "Disable shuffle" : "Enable shuffle"}
        className={cn(
          "transition-colors",
          shuffleEnabled ? "text-primary" : "text-zinc-400 hover:text-white"
        )}
      >
        <Shuffle className="w-4 h-4" />
      </button>

      <button 
        onClick={previous}
        aria-label="Previous track"
        className="text-zinc-400 hover:text-white transition-colors"
      >
        <SkipBack className="w-5 h-5 fill-current" />
      </button>

      <button 
        onClick={handlePlayPause}
        aria-label={isPlaying ? "Pause" : "Play"}
        className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:scale-105 transition-transform text-black shadow-lg"
      >
        {isPlaying ? (
          <Pause className="w-5 h-5 fill-current" />
        ) : (
          <Play className="w-5 h-5 fill-current ml-1" />
        )}
      </button>

      <button 
        onClick={next}
        aria-label="Next track"
        className="text-zinc-400 hover:text-white transition-colors"
      >
        <SkipForward className="w-5 h-5 fill-current" />
      </button>

      <button 
        onClick={toggleRepeat}
        aria-label={repeatMode === "one" ? "Repeat one" : repeatMode === "all" ? "Repeat all" : "Enable repeat"}
        className={cn(
          "transition-colors",
          repeatMode !== "off" ? "text-primary" : "text-zinc-400 hover:text-white"
        )}
      >
        {repeatMode === "one" ? (
          <Repeat1 className="w-4 h-4" />
        ) : (
          <Repeat className="w-4 h-4" />
        )}
      </button>
    </div>
  );
}
