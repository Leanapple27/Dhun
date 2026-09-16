"use client";
import { Track, usePlayerStore } from "../../stores/playerStore";
import { Play, Pause, MoreHorizontal, Clock } from "lucide-react";
import { formatTime, cn } from "../../lib/utils";
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

interface TrackListProps {
  tracks: Track[];
}

export default function TrackList({ tracks }: TrackListProps) {
  const { currentTrack, isPlaying, play, pause, addToQueue } = usePlayerStore();

  return (
    <div className="w-full flex flex-col">
      <div className="grid grid-cols-[auto_1fr_auto_auto] gap-4 px-4 py-2 text-sm font-medium text-zinc-400 border-b border-white/5">
        <div className="w-8 text-center">#</div>
        <div>Title</div>
        <div className="w-32 hidden md:block">Plays</div>
        <div className="w-12 flex justify-center"><Clock className="w-4 h-4" /></div>
      </div>

      <div className="mt-2 space-y-1">
        {tracks.map((track, index) => {
          const isCurrentTrack = currentTrack?.id === track.id;

          return (
            <div 
              key={track.id}
              className="grid grid-cols-[auto_1fr_auto_auto] gap-4 px-4 py-2 rounded-lg hover:bg-white/5 transition-colors items-center group"
              onDoubleClick={() => play(track)}
            >
              <div className="w-8 flex justify-center items-center relative">
                <span className={cn("text-sm text-zinc-400 group-hover:opacity-0", isCurrentTrack && "text-primary opacity-100 group-hover:opacity-0")}>
                  {isCurrentTrack && isPlaying ? (
                    <div className="flex items-end justify-center gap-[2px] h-3 w-4">
                      <span className="w-[3px] h-full bg-primary animate-pulse" style={{ animationDelay: '0ms' }} />
                      <span className="w-[3px] h-2/3 bg-primary animate-pulse" style={{ animationDelay: '150ms' }} />
                      <span className="w-[3px] h-full bg-primary animate-pulse" style={{ animationDelay: '300ms' }} />
                    </div>
                  ) : (
                    index + 1
                  )}
                </span>
                
                <button 
                  className={cn(
                    "absolute opacity-0 group-hover:opacity-100 transition-opacity",
                    isCurrentTrack && !isPlaying && "opacity-100"
                  )}
                  onClick={() => isCurrentTrack && isPlaying ? pause() : play(track)}
                >
                  {isCurrentTrack && isPlaying ? (
                    <Pause className="w-4 h-4 text-white fill-current" />
                  ) : (
                    <Play className="w-4 h-4 text-white fill-current" />
                  )}
                </button>
              </div>

              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={track.thumbnail} alt={track.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className={cn("truncate text-base", isCurrentTrack ? "text-primary font-medium" : "text-white")}>{track.title}</span>
                  <span className="truncate text-sm text-zinc-400 hover:underline cursor-pointer">{track.artist}</span>
                </div>
              </div>

              <div className="w-32 hidden md:block text-sm text-zinc-400" suppressHydrationWarning>
                {((track.duration * 1374) % 900000 + 100000).toLocaleString("en-US")}
              </div>

              <div className="w-12 flex items-center justify-between text-sm text-zinc-400">
                <span>{formatTime(track.duration)}</span>
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger asChild>
                    <button className="opacity-0 group-hover:opacity-100 p-1 hover:text-white transition-colors">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Portal>
                    <DropdownMenu.Content className="min-w-[160px] bg-surface-hover rounded-md p-1 shadow-2xl border border-white/10 z-50 text-sm" sideOffset={5}>
                      <DropdownMenu.Item 
                        className="px-3 py-2 outline-none cursor-pointer hover:bg-white/10 rounded-sm text-white"
                        onClick={() => addToQueue(track)}
                      >
                        Add to queue
                      </DropdownMenu.Item>
                      <DropdownMenu.Item className="px-3 py-2 outline-none cursor-pointer hover:bg-white/10 rounded-sm text-white">
                        Add to playlist
                      </DropdownMenu.Item>
                    </DropdownMenu.Content>
                  </DropdownMenu.Portal>
                </DropdownMenu.Root>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
