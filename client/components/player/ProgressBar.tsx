"use client";
import { usePlayerStore } from "../../stores/playerStore";
import * as Slider from "@radix-ui/react-slider";
import { formatTime } from "../../lib/utils";

export default function ProgressBar() {
  const { currentTime, duration, seek } = usePlayerStore();

  const handleSeek = (value: number[]) => {
    seek(value[0]);
  };

  return (
    <div className="w-full flex items-center gap-3 text-xs text-zinc-400 font-medium">
      <span className="w-10 text-right">{formatTime(currentTime)}</span>
      
      <Slider.Root
        className="relative flex items-center select-none touch-none w-full h-4 group cursor-pointer"
        aria-label="Track progress slider"
        value={[currentTime]}
        max={duration || 100}
        step={1}
        onValueChange={handleSeek}
      >
        <Slider.Track className="bg-white/10 relative grow rounded-full h-1.5 overflow-hidden">
          <Slider.Range className="absolute bg-primary rounded-full h-full group-hover:bg-primary-hover transition-colors" />
        </Slider.Track>
        <Slider.Thumb className="block w-3 h-3 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none" />
      </Slider.Root>

      <span className="w-10">{formatTime(duration)}</span>
    </div>
  );
}
