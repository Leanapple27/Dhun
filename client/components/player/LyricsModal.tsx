"use client";

import { useEffect, useState, useRef } from "react";
import { usePlayerStore } from "../../stores/playerStore";
import { getLyrics } from "../../lib/api";
import { X, Mic2 } from "lucide-react";
import { cn } from "../../lib/utils";

interface LyricsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ParsedLyric {
  time: number;
  text: string;
}

export default function LyricsModal({ isOpen, onClose }: LyricsModalProps) {
  const { currentTrack, currentTime } = usePlayerStore();
  const [plainLyrics, setPlainLyrics] = useState<string>("");
  const [syncedLyrics, setSyncedLyrics] = useState<ParsedLyric[]>([]);
  const [loading, setLoading] = useState(false);
  const activeLineRef = useRef<HTMLParagraphElement | null>(null);

  useEffect(() => {
    if (activeLineRef.current) {
      activeLineRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [currentTime]);

  useEffect(() => {
    if (!isOpen || !currentTrack) return;

    const fetchSongLyrics = async () => {
      try {
        setLoading(true);
        setPlainLyrics("");
        setSyncedLyrics([]);

        const res = await getLyrics(
          currentTrack.id,
          currentTrack.title,
          currentTrack.artist,
          currentTrack.duration
        );
        const data = res?.data;

        if (data?.syncedLyrics) {
          // Parse LRC format: [00:12.34] Lyric line
          const lines = data.syncedLyrics.split("\n");
          const parsed: ParsedLyric[] = [];

          for (const line of lines) {
            const match = line.match(/\[(\d+):(\d+\.?\d*)\](.*)/);
            if (match) {
              const minutes = parseInt(match[1], 10);
              const seconds = parseFloat(match[2]);
              parsed.push({
                time: minutes * 60 + seconds,
                text: match[3].trim()
              });
            }
          }
          setSyncedLyrics(parsed);
        } else if (data?.plainLyrics) {
          setPlainLyrics(data.plainLyrics);
        } else {
          setPlainLyrics("No lyrics found for this track.");
        }
      } catch {
        setPlainLyrics("Lyrics currently unavailable for this track.");
      } finally {
        setLoading(false);
      }
    };

    fetchSongLyrics();
  }, [isOpen, currentTrack]);

  if (!isOpen || !currentTrack) return null;

  return (
    <div 
      role="dialog"
      aria-modal="true"
      aria-label="Synchronized lyrics"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-2xl flex flex-col p-6 md:p-12 overflow-hidden animate-in fade-in duration-200"
    >
      <div className="flex items-center justify-between max-w-4xl mx-auto w-full pb-6 border-b border-white/10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl overflow-hidden shadow-lg flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={currentTrack.thumbnail} alt={currentTrack.title} className="w-full h-full object-cover" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white truncate">{currentTrack.title}</h2>
            <p className="text-sm text-zinc-400 truncate">{currentTrack.artist}</p>
          </div>
        </div>

        <button
          onClick={onClose}
          aria-label="Close lyrics"
          className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto max-w-4xl mx-auto w-full py-12 scrollbar-none text-center space-y-6">
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center text-zinc-400 gap-3">
            <Mic2 className="w-8 h-8 animate-pulse text-primary" />
            <p className="text-sm">Fetching lyrics...</p>
          </div>
        ) : syncedLyrics.length > 0 ? (
          <div className="space-y-6 py-8">
            {syncedLyrics.map((item, idx) => {
              const isCurrent =
                currentTime >= item.time &&
                (idx === syncedLyrics.length - 1 || currentTime < syncedLyrics[idx + 1].time);

              return (
                <p
                  key={idx}
                  ref={isCurrent ? activeLineRef : null}
                  className={cn(
                    "text-xl sm:text-3xl font-bold transition-all duration-300 leading-relaxed",
                    isCurrent
                      ? "text-primary scale-105 font-extrabold"
                      : "text-zinc-600 hover:text-zinc-400"
                  )}
                >
                  {item.text || "♪"}
                </p>
              );
            })}
          </div>
        ) : (
          <div className="whitespace-pre-line text-lg sm:text-2xl text-zinc-300 leading-relaxed font-medium max-w-2xl mx-auto">
            {plainLyrics}
          </div>
        )}
      </div>
    </div>
  );
}
