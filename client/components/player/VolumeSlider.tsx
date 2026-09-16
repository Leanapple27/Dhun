"use client";
import { usePlayerStore } from "../../stores/playerStore";
import * as Slider from "@radix-ui/react-slider";
import { Volume1, Volume2, VolumeX } from "lucide-react";

export default function VolumeSlider() {
  const { volume, isMuted, setVolume, toggleMute } = usePlayerStore();

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0] / 100);
  };

  const VolumeIcon = isMuted || volume === 0 
    ? VolumeX 
    : volume < 0.5 ? Volume1 : Volume2;

  return (
    <div className="flex items-center gap-2 w-full group">
      <button 
        onClick={toggleMute}
        aria-label={isMuted ? "Unmute audio" : "Mute audio"}
        className="text-zinc-400 hover:text-white transition-colors"
      >
        <VolumeIcon className="w-5 h-5" />
      </button>
      
      <Slider.Root
        className="relative flex items-center select-none touch-none w-full h-4 cursor-pointer"
        aria-label="Volume level"
        value={[isMuted ? 0 : volume * 100]}
        max={100}
        step={1}
        onValueChange={handleVolumeChange}
      >
        <Slider.Track className="bg-white/10 relative grow rounded-full h-1.5 overflow-hidden">
          <Slider.Range className="absolute bg-white group-hover:bg-primary rounded-full h-full transition-colors" />
        </Slider.Track>
        <Slider.Thumb className="block w-3 h-3 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none" />
      </Slider.Root>
    </div>
  );
}
