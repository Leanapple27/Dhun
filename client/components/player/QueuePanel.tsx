"use client";
import { usePlayerStore } from "../../stores/playerStore";
import { useQueueStore } from "../../stores/queueStore";
import { X, Play, Trash2 } from "lucide-react";
import { cn } from "../../lib/utils";

export default function QueuePanel() {
  const { isQueueOpen, toggleQueue } = useQueueStore();
  const { queue, queueIndex, currentTrack, play, removeFromQueue } = usePlayerStore();

  if (!isQueueOpen) return null;

  return (
    <div className="fixed right-0 top-0 bottom-24 w-80 bg-surface/95 backdrop-blur-xl border-l border-white/5 shadow-2xl z-40 flex flex-col transform transition-transform duration-300">
      <div className="p-4 flex items-center justify-between border-b border-white/5">
        <h2 className="text-lg font-bold">Queue</h2>
        <button onClick={toggleQueue} className="p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {queue.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-zinc-500">
            <p>Your queue is empty</p>
          </div>
        ) : (
          <div className="space-y-1">
            {queue.map((track, index) => {
              const isPlaying = index === queueIndex;
              return (
                <div 
                  key={`${track.id}-${index}`}
                  className={cn(
                    "flex items-center gap-3 p-2 rounded-md group hover:bg-white/5 transition-colors",
                    isPlaying ? "bg-white/10" : ""
                  )}
                >
                  <div className="relative w-10 h-10 flex-shrink-0 rounded overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={track.thumbnail} alt={track.title} className="w-full h-full object-cover" />
                    <button 
                      onClick={() => {
                        usePlayerStore.getState().setQueueIndex(index);
                        play(track);
                      }}
                      className={cn(
                        "absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity",
                        isPlaying ? "opacity-100" : ""
                      )}
                    >
                      {isPlaying ? (
                        <div className="flex items-end justify-center gap-0.5 h-3">
                          <span className="w-0.5 h-full bg-primary animate-pulse" style={{ animationDelay: '0ms' }} />
                          <span className="w-0.5 h-2/3 bg-primary animate-pulse" style={{ animationDelay: '150ms' }} />
                          <span className="w-0.5 h-full bg-primary animate-pulse" style={{ animationDelay: '300ms' }} />
                        </div>
                      ) : (
                        <Play className="w-4 h-4 text-white fill-current" />
                      )}
                    </button>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm font-medium truncate", isPlaying ? "text-primary" : "text-white")}>{track.title}</p>
                    <p className="text-xs text-zinc-400 truncate">{track.artist}</p>
                  </div>

                  <button 
                    onClick={() => removeFromQueue(index)}
                    className="p-2 opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-red-400 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
