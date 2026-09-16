"use client";

import { useState, useEffect } from "react";
import { Track, usePlayerStore } from "../../stores/playerStore";
import { Phone, Play, Plus, Trash2, Music } from "lucide-react";
import { cn } from "../../lib/utils";

interface SpeedDialSlot {
  slot: number;
  track: Track | null;
}

const defaultSlots: SpeedDialSlot[] = [
  { slot: 1, track: { id: "Wqu4MRQOgyo", title: "Dhun (Saiyaara)", artist: "Arijit Singh", thumbnail: "https://i.ytimg.com/vi/Wqu4MRQOgyo/mqdefault.jpg", duration: 277 } },
  { slot: 2, track: { id: "NJAv_7lHUIU", title: "Kesariya", artist: "Arijit Singh, Pritam", thumbnail: "https://i.ytimg.com/vi/NJAv_7lHUIU/mqdefault.jpg", duration: 268 } },
  { slot: 3, track: { id: "YALvuUpY_b0", title: "Apna Bana Le", artist: "Arijit Singh", thumbnail: "https://i.ytimg.com/vi/YALvuUpY_b0/mqdefault.jpg", duration: 262 } },
  { slot: 4, track: { id: "fsiPzT50ZiM", title: "Tum Hi Ho", artist: "Arijit Singh", thumbnail: "https://i.ytimg.com/vi/fsiPzT50ZiM/mqdefault.jpg", duration: 262 } },
  { slot: 5, track: { id: "4NRXx6U8ABQ", title: "Blinding Lights", artist: "The Weeknd", thumbnail: "https://i.ytimg.com/vi/4NRXx6U8ABQ/mqdefault.jpg", duration: 200 } },
  { slot: 6, track: { id: "JGwWNGJdvx8", title: "Shape of You", artist: "Ed Sheeran", thumbnail: "https://i.ytimg.com/vi/JGwWNGJdvx8/mqdefault.jpg", duration: 233 } },
  { slot: 7, track: { id: "TUVcZfQe-Kw", title: "Levitating", artist: "Dua Lipa", thumbnail: "https://i.ytimg.com/vi/TUVcZfQe-Kw/mqdefault.jpg", duration: 203 } },
  { slot: 8, track: { id: "34Na4j8AVgA", title: "Starboy", artist: "The Weeknd", thumbnail: "https://i.ytimg.com/vi/34Na4j8AVgA/mqdefault.jpg", duration: 230 } },
  { slot: 9, track: null },
];

export default function SpeedDialPage() {
  const [slots, setSlots] = useState<SpeedDialSlot[]>(defaultSlots);
  const { play, currentTrack, isPlaying } = usePlayerStore();

  useEffect(() => {
    const saved = localStorage.getItem("dhun_speed_dial");
    if (saved) {
      try {
        setSlots(JSON.parse(saved));
      } catch {}
    }
  }, []);

  const saveSlots = (newSlots: SpeedDialSlot[]) => {
    setSlots(newSlots);
    localStorage.setItem("dhun_speed_dial", JSON.stringify(newSlots));
  };

  // Keyboard shortcut listener: Press 1-9 to trigger speed dial
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement).tagName)) return;

      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= 9) {
        const target = slots.find(s => s.slot === num);
        if (target?.track) {
          play(target.track);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [slots, play]);

  const handleAssignCurrent = (slotNum: number) => {
    if (!currentTrack) return;
    const updated = slots.map(s => s.slot === slotNum ? { ...s, track: currentTrack } : s);
    saveSlots(updated);
  };

  const handleClearSlot = (slotNum: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = slots.map(s => s.slot === slotNum ? { ...s, track: null } : s);
    saveSlots(updated);
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Phone className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Speed Dial</h1>
          </div>
          <p className="text-sm text-zinc-400 mt-1">
            Press keys <span className="text-primary font-semibold">1 through 9</span> anywhere to instantly play your favorite tune.
          </p>
        </div>

        {currentTrack && (
          <div className="hidden sm:flex items-center gap-3 bg-surface/60 border border-white/10 px-4 py-2 rounded-xl text-xs">
            <span className="text-zinc-400">Now Playing:</span>
            <span className="text-white font-medium truncate max-w-[140px]">{currentTrack.title}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 pt-4">
        {slots.map((item) => {
          const isCurrent = currentTrack?.id === item.track?.id;

          return (
            <div
              key={item.slot}
              onClick={() => item.track && play(item.track)}
              className={cn(
                "relative group bg-surface/40 hover:bg-surface border border-white/5 hover:border-primary/40 rounded-2xl p-5 transition-all flex flex-col justify-between aspect-square cursor-pointer shadow-lg",
                isCurrent && isPlaying && "border-primary ring-2 ring-primary/30"
              )}
            >
              {/* Dial number badge */}
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center text-base border border-primary/30">
                  {item.slot}
                </div>

                {item.track && (
                  <button
                    onClick={(e) => handleClearSlot(item.slot, e)}
                    className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-red-400 transition-all p-1.5 rounded-lg hover:bg-white/5"
                    title="Remove from slot"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Slot content */}
              {item.track ? (
                <div className="flex flex-col items-center text-center my-auto">
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden shadow-md mb-3 group-hover:scale-105 transition-transform">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.track.thumbnail}
                      alt={item.track.title}
                      className="w-full h-full object-cover"
                    />
                    <div className={cn(
                      "absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity",
                      isCurrent && isPlaying && "opacity-100"
                    )}>
                      <Play className="w-6 h-6 text-white fill-current" />
                    </div>
                  </div>
                  <h3 className="font-semibold text-white text-sm truncate w-full">{item.track.title}</h3>
                  <p className="text-xs text-zinc-400 truncate w-full">{item.track.artist}</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center my-auto text-zinc-500">
                  <Music className="w-10 h-10 mb-2 stroke-[1.5]" />
                  <p className="text-xs">Empty Slot</p>
                  {currentTrack && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAssignCurrent(item.slot);
                      }}
                      className="mt-3 flex items-center gap-1.5 text-xs bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1.5 rounded-full font-medium transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Set Current Track
                    </button>
                  )}
                </div>
              )}

              {/* Bottom footer hint */}
              <div className="text-[11px] text-zinc-500 flex justify-between items-center border-t border-white/5 pt-2">
                <span>Key [{item.slot}]</span>
                {item.track && isCurrent && isPlaying && (
                  <span className="text-primary font-medium flex items-center gap-1">
                    Playing
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
