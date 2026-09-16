"use client";
import { useState } from "react";
import { usePlayerStore } from "../../stores/playerStore";
import { useQueueStore } from "../../stores/queueStore";
import { audioController } from "../../lib/audioController";
import PlayerControls from "../player/PlayerControls";
import ProgressBar from "../player/ProgressBar";
import VolumeSlider from "../player/VolumeSlider";
import NowPlaying from "../player/NowPlaying";
import LyricsModal from "../player/LyricsModal";
import NowPlayingWindow from "../player/NowPlayingWindow";
import { ListMusic, Mic2, Maximize2 } from "lucide-react";
import { cn } from "../../lib/utils";

export default function BottomPlayer() {
  const currentTrack = usePlayerStore((state) => state.currentTrack);
  const openNowPlayingWindow = usePlayerStore((state) => state.openNowPlayingWindow);
  const { isQueueOpen, toggleQueue } = useQueueStore();
  const [isLyricsOpen, setIsLyricsOpen] = useState(false);

  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  const cycleSpeed = () => {
    const speeds = [1, 1.25, 1.5, 2];
    const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
    const nextSpeed = speeds[nextIdx];
    setPlaybackSpeed(nextSpeed);
    audioController.setPlaybackRate(nextSpeed);
  };

  if (!currentTrack) return null;

  return (
    <div className="h-24 bg-player border-t border-white/5 flex items-center justify-between px-4 w-full fixed bottom-0 left-0 z-50">
      <div className="w-[30%] min-w-[180px]">
        <NowPlaying track={currentTrack} />
      </div>
      
      <div className="flex-1 max-w-2xl flex flex-col items-center gap-2 px-4">
        <PlayerControls />
        <ProgressBar />
      </div>

      <div className="w-[30%] min-w-[180px] flex items-center justify-end gap-3.5">
        <button
          onClick={cycleSpeed}
          aria-label={`Current playback speed ${playbackSpeed}x. Click to change`}
          className="text-xs font-bold px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-colors"
          title="Playback Speed (1x, 1.25x, 1.5x, 2x)"
        >
          {playbackSpeed}x
        </button>

        <button
          onClick={() => setIsLyricsOpen(true)}
          aria-label="Open synchronized lyrics"
          className="text-zinc-400 hover:text-white transition-colors"
          title="Lyrics"
        >
          <Mic2 className="w-5 h-5" />
        </button>

        <button 
          onClick={toggleQueue}
          aria-label={isQueueOpen ? "Close play queue" : "Open play queue"}
          className={cn(
            "text-zinc-400 hover:text-white transition-colors",
            isQueueOpen && "text-primary"
          )}
          title="Queue"
        >
          <ListMusic className="w-5 h-5" />
        </button>

        <button
          onClick={openNowPlayingWindow}
          aria-label="Expand Now Playing Window"
          className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
          title="Expand View"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        <div className="w-24">
          <VolumeSlider />
        </div>
      </div>

      <LyricsModal isOpen={isLyricsOpen} onClose={() => setIsLyricsOpen(false)} />
      <NowPlayingWindow />
    </div>
  );
}
