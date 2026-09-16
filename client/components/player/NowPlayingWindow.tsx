"use client";

import { useState, useEffect, useRef } from "react";
import { usePlayerStore, Track } from "../../stores/playerStore";
import { useQueueStore } from "../../stores/queueStore";
import { getLyrics, searchMusic } from "../../lib/api";
import {
  ChevronDown,
  ThumbsUp,
  ThumbsDown,
  Share2,
  MoreVertical,
  Plus,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Volume2,
  VolumeX,
  Radio,
  Sparkles,
  ListMusic,
  Mic2,
  Maximize2
} from "lucide-react";
import { cn } from "../../lib/utils";
import ProgressBar from "./ProgressBar";
import VolumeSlider from "./VolumeSlider";

interface ParsedLyric {
  time: number;
  text: string;
}

export default function NowPlayingWindow() {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    play,
    pause,
    resume,
    next,
    previous,
    queue,
    queueIndex,
    shuffleEnabled,
    toggleShuffle,
    repeatMode,
    toggleRepeat,
    isNowPlayingWindowOpen,
    closeNowPlayingWindow,
    autoPlaySimilar,
    toggleAutoPlaySimilar
  } = usePlayerStore();

  const [activeMediaMode, setActiveMediaMode] = useState<"song" | "video">("song");
  const [activeTab, setActiveTab] = useState<"upnext" | "lyrics" | "related">("upnext");
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>("All");

  // Lyrics state
  const [plainLyrics, setPlainLyrics] = useState<string>("");
  const [syncedLyrics, setSyncedLyrics] = useState<ParsedLyric[]>([]);
  const [lyricsLoading, setLyricsLoading] = useState(false);
  const activeLineRef = useRef<HTMLParagraphElement | null>(null);

  // Related tracks state
  const [relatedTracks, setRelatedTracks] = useState<Track[]>([]);
  const [relatedLoading, setRelatedLoading] = useState(false);

  // Auto-scroll lyrics
  useEffect(() => {
    if (activeLineRef.current) {
      activeLineRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [currentTime]);

  // Fetch lyrics when track changes or lyrics tab opened
  useEffect(() => {
    if (!currentTrack || !isNowPlayingWindowOpen) return;

    const loadLyrics = async () => {
      try {
        setLyricsLoading(true);
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
          const lines = data.syncedLyrics.split("\n");
          const parsed: ParsedLyric[] = [];
          for (const line of lines) {
            const match = line.match(/\[(\d+):(\d+\.?\d*)\](.*)/);
            if (match) {
              const minutes = parseInt(match[1], 10);
              const seconds = parseFloat(match[2]);
              parsed.push({
                time: minutes * 60 + seconds,
                text: match[3]?.trim() || ""
              });
            }
          }
          setSyncedLyrics(parsed);
        } else if (data?.plainLyrics) {
          setPlainLyrics(data.plainLyrics);
        }
      } catch {
        setPlainLyrics("");
      } finally {
        setLyricsLoading(false);
      }
    };

    loadLyrics();
  }, [currentTrack?.id, isNowPlayingWindowOpen]);

  // Fetch related tracks
  useEffect(() => {
    if (!currentTrack || !isNowPlayingWindowOpen) return;

    const loadRelated = async () => {
      try {
        setRelatedLoading(true);
        const res = await searchMusic(currentTrack.artist || "Pop Hits", "music_songs");
        if (Array.isArray(res?.data)) {
          setRelatedTracks(res.data.filter((t: any) => t.id !== currentTrack.id).slice(0, 10));
        }
      } catch {
        setRelatedTracks([]);
      } finally {
        setRelatedLoading(false);
      }
    };

    loadRelated();
  }, [currentTrack?.id, isNowPlayingWindowOpen]);

  if (!isNowPlayingWindowOpen || !currentTrack) return null;

  // Find active lyric index
  const activeLyricIndex = syncedLyrics.findLastIndex((l) => currentTime >= l.time);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Now Playing View"
      className="fixed inset-0 z-50 bg-[#030303] text-white flex flex-col animate-in fade-in slide-in-from-bottom-6 duration-200"
    >
      {/* Top Bar Header */}
      <div className="h-16 px-6 flex items-center justify-between border-b border-white/5 bg-black/40 backdrop-blur-md">
        {/* Collapse Button */}
        <button
          onClick={closeNowPlayingWindow}
          aria-label="Collapse Now Playing Window"
          className="flex items-center gap-2 p-2 rounded-full hover:bg-white/10 text-zinc-300 hover:text-white transition-colors cursor-pointer"
        >
          <ChevronDown className="w-6 h-6" />
        </button>

        {/* Center Song | Video Switcher (Screenshot 3) */}
        <div className="flex items-center bg-[#1f1f1f] p-1 rounded-full border border-white/10 shadow-inner">
          <button
            onClick={() => setActiveMediaMode("song")}
            className={cn(
              "px-5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer",
              activeMediaMode === "song"
                ? "bg-white text-black shadow-md"
                : "text-zinc-400 hover:text-white"
            )}
          >
            Song
          </button>
          <button
            onClick={() => setActiveMediaMode("video")}
            className={cn(
              "px-5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer",
              activeMediaMode === "video"
                ? "bg-white text-black shadow-md"
                : "text-zinc-400 hover:text-white"
            )}
          >
            Video
          </button>
        </div>

        {/* Right Quick Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: currentTrack.title,
                  text: `Listening to ${currentTrack.title} by ${currentTrack.artist} on Dhun`,
                  url: window.location.href
                });
              } else {
                navigator.clipboard.writeText(window.location.href);
              }
            }}
            aria-label="Share song"
            className="p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Body: Stage (Left) & Side Panel (Right) */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left / Center Stage */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden">
          {/* Ambient Glow matching album art */}
          <div
            className="absolute inset-0 opacity-25 filter blur-[100px] scale-125 pointer-events-none transition-all duration-700"
            style={{
              backgroundImage: `url(${currentTrack.thumbnail || "https://i.ytimg.com/vi/" + currentTrack.id + "/hqdefault.jpg"})`,
              backgroundPosition: "center",
              backgroundSize: "cover"
            }}
          />

          {/* Media Viewport */}
          <div className="relative z-10 w-full max-w-[440px] aspect-square flex items-center justify-center">
            {activeMediaMode === "song" ? (
              <div className="w-full h-full rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-[#181818] transition-all">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentTrack.thumbnail || `https://i.ytimg.com/vi/${currentTrack.id}/hqdefault.jpg`}
                  alt={currentTrack.title}
                  className="w-full h-full object-cover select-none"
                />
              </div>
            ) : (
              <div className="w-full h-full rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-black">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${currentTrack.id}?autoplay=1&enablejsapi=1`}
                  title={currentTrack.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              </div>
            )}
          </div>

          {/* Track Meta & Like/Dislike Row (Screenshot 3) */}
          <div className="relative z-10 w-full max-w-[440px] mt-6 flex items-center justify-between">
            <div className="min-w-0 flex-1 pr-4">
              <h2 className="text-xl sm:text-2xl font-black text-white truncate tracking-tight">
                {currentTrack.title}
              </h2>
              <p className="text-sm text-zinc-400 truncate mt-1">
                {currentTrack.artist} {currentTrack.album ? `• ${currentTrack.album}` : ""}
              </p>
            </div>

            {/* Like / Dislike / Share Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setIsLiked(!isLiked);
                  if (isDisliked) setIsDisliked(false);
                }}
                aria-label="Thumbs up"
                className={cn(
                  "p-2.5 rounded-full transition-colors cursor-pointer",
                  isLiked ? "bg-white/15 text-white" : "text-zinc-400 hover:text-white hover:bg-white/10"
                )}
              >
                <ThumbsUp className={cn("w-5 h-5", isLiked && "fill-white")} />
              </button>

              <button
                onClick={() => {
                  setIsDisliked(!isDisliked);
                  if (isLiked) setIsLiked(false);
                }}
                aria-label="Thumbs down"
                className={cn(
                  "p-2.5 rounded-full transition-colors cursor-pointer",
                  isDisliked ? "bg-white/15 text-white" : "text-zinc-400 hover:text-white hover:bg-white/10"
                )}
              >
                <ThumbsDown className={cn("w-5 h-5", isDisliked && "fill-white")} />
              </button>
            </div>
          </div>
        </div>

        {/* Right Side Panel: UP NEXT | LYRICS | RELATED (Screenshot 3) */}
        <div className="w-full lg:w-[460px] xl:w-[500px] border-l border-white/5 bg-[#0a0a0a]/90 flex flex-col overflow-hidden">
          {/* Panel Tab Navigation */}
          <div className="flex items-center border-b border-white/10 px-6 pt-2 bg-white/[0.01]">
            <button
              onClick={() => setActiveTab("upnext")}
              className={cn(
                "py-3 px-4 text-xs font-bold tracking-wider uppercase border-b-2 transition-colors cursor-pointer",
                activeTab === "upnext"
                  ? "border-primary text-white"
                  : "border-transparent text-zinc-400 hover:text-zinc-200"
              )}
            >
              Up Next
            </button>
            <button
              onClick={() => setActiveTab("lyrics")}
              className={cn(
                "py-3 px-4 text-xs font-bold tracking-wider uppercase border-b-2 transition-colors cursor-pointer",
                activeTab === "lyrics"
                  ? "border-primary text-white"
                  : "border-transparent text-zinc-400 hover:text-zinc-200"
              )}
            >
              Lyrics
            </button>
            <button
              onClick={() => setActiveTab("related")}
              className={cn(
                "py-3 px-4 text-xs font-bold tracking-wider uppercase border-b-2 transition-colors cursor-pointer",
                activeTab === "related"
                  ? "border-primary text-white"
                  : "border-transparent text-zinc-400 hover:text-zinc-200"
              )}
            >
              Related
            </button>
          </div>

          {/* Tab Content: UP NEXT */}
          {activeTab === "upnext" && (
            <div className="flex-1 flex flex-col overflow-hidden p-6">
              {/* Playing From Header & Auto-play switch */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold">Playing from</p>
                  <p className="text-sm font-bold text-white truncate max-w-[220px]">
                    {currentTrack.title} Radio
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-zinc-300">Auto-play</span>
                    <button
                      onClick={toggleAutoPlaySimilar}
                      role="switch"
                      aria-checked={autoPlaySimilar}
                      className={cn(
                        "w-10 h-5 rounded-full p-0.5 transition-colors cursor-pointer",
                        autoPlaySimilar ? "bg-primary" : "bg-white/20"
                      )}
                    >
                      <div
                        className={cn(
                          "w-4 h-4 rounded-full bg-white transition-transform",
                          autoPlaySimilar ? "translate-x-5" : "translate-x-0"
                        )}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Sub-pills: All / Familiar / Popular / Discover / Deep cuts (Screenshot 3) */}
              <div className="flex items-center gap-1.5 py-3 overflow-x-auto scrollbar-none">
                {["All", "Familiar", "Popular", "Discover", "Deep cuts"].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer",
                      activeFilter === filter
                        ? "bg-white text-black"
                        : "bg-white/5 text-zinc-300 hover:bg-white/10"
                    )}
                  >
                    {filter}
                  </button>
                ))}
              </div>

              {/* Queue List */}
              <div className="flex-1 overflow-y-auto space-y-1 pr-1 scrollbar-thin scrollbar-thumb-white/10">
                {queue.length === 0 ? (
                  <div className="py-12 text-center text-zinc-500 text-xs">
                    Queue is empty. Select a song or playlist to start listening.
                  </div>
                ) : (
                  queue.map((track, idx) => {
                    const isCurrent = track.id === currentTrack.id;
                    return (
                      <div
                        key={`${track.id}-${idx}`}
                        onClick={() => play(track)}
                        className={cn(
                          "flex items-center gap-3 p-2 rounded-xl transition-all group cursor-pointer",
                          isCurrent ? "bg-white/10 text-white" : "hover:bg-white/5 text-zinc-300 hover:text-white"
                        )}
                      >
                        <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-[#242424] relative">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={track.thumbnail || `https://i.ytimg.com/vi/${track.id}/mqdefault.jpg`}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                          {isCurrent && isPlaying && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className={cn("text-xs font-bold truncate", isCurrent ? "text-primary" : "text-white")}>
                            {track.title}
                          </p>
                          <p className="text-[11px] text-zinc-400 truncate">{track.artist}</p>
                        </div>

                        <span className="text-[11px] text-zinc-500 font-mono">
                          {Math.floor(track.duration / 60)}:
                          {String(Math.floor(track.duration % 60)).padStart(2, "0")}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Tab Content: LYRICS */}
          {activeTab === "lyrics" && (
            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-white/10">
              {lyricsLoading ? (
                <div className="py-16 text-center text-zinc-400 text-xs animate-pulse">
                  Fetching verified lyrics...
                </div>
              ) : syncedLyrics.length > 0 ? (
                <div className="space-y-6 text-center sm:text-left">
                  {syncedLyrics.map((line, index) => {
                    const isActive = index === activeLyricIndex;
                    return (
                      <p
                        key={index}
                        ref={isActive ? activeLineRef : null}
                        className={cn(
                          "transition-all duration-300 text-lg sm:text-xl font-bold leading-relaxed select-none cursor-pointer",
                          isActive
                            ? "text-white scale-105 origin-left"
                            : "text-zinc-500 hover:text-zinc-300"
                        )}
                      >
                        {line.text}
                      </p>
                    );
                  })}
                </div>
              ) : plainLyrics ? (
                <div className="whitespace-pre-line text-base text-zinc-300 leading-relaxed">
                  {plainLyrics}
                </div>
              ) : (
                <div className="py-16 text-center text-zinc-500 text-xs">
                  No lyrics found for this song.
                </div>
              )}
            </div>
          )}

          {/* Tab Content: RELATED */}
          {activeTab === "related" && (
            <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-white/10">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                More from {currentTrack.artist}
              </h3>

              {relatedLoading ? (
                <div className="py-12 text-center text-zinc-400 text-xs animate-pulse">
                  Finding similar hits...
                </div>
              ) : (
                <div className="space-y-1.5">
                  {relatedTracks.map((relTrack) => (
                    <div
                      key={relTrack.id}
                      onClick={() => play(relTrack)}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 text-zinc-300 hover:text-white transition-all group cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-[#242424]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={relTrack.thumbnail || `https://i.ytimg.com/vi/${relTrack.id}/mqdefault.jpg`}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold truncate text-white">{relTrack.title}</p>
                        <p className="text-[11px] text-zinc-400 truncate">{relTrack.artist}</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          play(relTrack);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-2 rounded-full bg-white/10 hover:bg-white text-white hover:text-black transition-all"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Integrated Full Playback Bar at Bottom */}
      <div className="h-24 px-6 border-t border-white/10 bg-black/60 backdrop-blur-md flex items-center justify-between gap-6">
        {/* Track snippet */}
        <div className="w-[25%] min-w-[140px] flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#242424] flex-shrink-0 shadow-md">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentTrack.thumbnail || `https://i.ytimg.com/vi/${currentTrack.id}/mqdefault.jpg`}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-white truncate">{currentTrack.title}</p>
            <p className="text-[11px] text-zinc-400 truncate">{currentTrack.artist}</p>
          </div>
        </div>

        {/* Center Controls & Progress Bar */}
        <div className="flex-1 max-w-2xl flex flex-col items-center gap-1.5">
          <div className="flex items-center gap-5">
            <button
              onClick={toggleShuffle}
              aria-label="Toggle shuffle"
              className={cn(
                "p-2 rounded-full transition-colors cursor-pointer",
                shuffleEnabled ? "text-primary" : "text-zinc-400 hover:text-white"
              )}
            >
              <Shuffle className="w-4 h-4" />
            </button>

            <button
              onClick={previous}
              aria-label="Previous track"
              className="text-zinc-300 hover:text-white transition-colors cursor-pointer"
            >
              <SkipBack className="w-5 h-5 fill-current" />
            </button>

            <button
              onClick={() => (isPlaying ? pause() : resume())}
              aria-label={isPlaying ? "Pause" : "Play"}
              className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-all shadow-lg cursor-pointer"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-black" />
              ) : (
                <Play className="w-5 h-5 fill-black translate-x-0.5" />
              )}
            </button>

            <button
              onClick={next}
              aria-label="Next track"
              className="text-zinc-300 hover:text-white transition-colors cursor-pointer"
            >
              <SkipForward className="w-5 h-5 fill-current" />
            </button>

            <button
              onClick={toggleRepeat}
              aria-label="Toggle repeat"
              className={cn(
                "p-2 rounded-full transition-colors cursor-pointer",
                repeatMode !== "off" ? "text-primary" : "text-zinc-400 hover:text-white"
              )}
            >
              <Repeat className="w-4 h-4" />
            </button>
          </div>

          <div className="w-full">
            <ProgressBar />
          </div>
        </div>

        {/* Right Volume Controls & Minimize */}
        <div className="w-[25%] min-w-[140px] flex items-center justify-end gap-3">
          <VolumeSlider />
          <button
            onClick={closeNowPlayingWindow}
            title="Minimize View"
            aria-label="Minimize View"
            className="p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
          >
            <ChevronDown className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
