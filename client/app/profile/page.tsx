"use client";

import { useState } from "react";
import { useAuthStore } from "../../stores/authStore";
import Link from "next/link";
import { User, Shield, Sparkles, Music2, Heart, ListMusic, Settings, LogOut, LogIn, Check, Sliders } from "lucide-react";
import { cn } from "../../lib/utils";

export default function ProfilePage() {
  const { user, logout } = useAuthStore();
  const [quality, setQuality] = useState<"normal" | "high" | "lossless">("high");
  const [normalizeAudio, setNormalizeAudio] = useState(true);
  const [autoplay, setAutoplay] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-10 pb-20">
      {/* Header Profile Card */}
      <div className="bg-gradient-to-r from-primary/20 via-surface to-surface border border-white/10 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-6 shadow-2xl relative overflow-hidden">
        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-primary/20 border-2 border-primary/50 flex items-center justify-center flex-shrink-0 text-primary shadow-inner">
          {user?.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
          ) : (
            <User className="w-12 h-12 md:w-16 md:h-16 stroke-[1.5]" />
          )}
        </div>

        <div className="flex-1 text-center md:text-left space-y-2">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              {user ? user.username : "Guest Listener"}
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/20 text-primary border border-primary/30 w-fit mx-auto md:mx-0">
              <Sparkles className="w-3.5 h-3.5" />
              {user ? "Dhun Premium" : "Free Explorer"}
            </span>
          </div>
          <p className="text-sm text-zinc-400">
            {user ? user.email : "Sign in to sync your library across devices and save custom playlists."}
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3">
            {user ? (
              <button
                onClick={logout}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-red-500/20 hover:text-red-400 transition-colors text-zinc-200"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-primary hover:bg-primary-hover text-white shadow-lg transition-all"
              >
                <LogIn className="w-4 h-4" />
                Sign In / Create Account
              </Link>
            )}
            <Link
              href="/speed-dial"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-surface border border-white/10 hover:border-white/20 transition-colors text-zinc-300"
            >
              Configure Speed Dial (1-9)
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Listening Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-surface/60 border border-white/5 p-5 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-medium">Favorite Tracks</span>
            <Heart className="w-4 h-4 text-pink-500" />
          </div>
          <p className="text-2xl font-bold text-white">24</p>
        </div>

        <div className="bg-surface/60 border border-white/5 p-5 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-medium">Playlists</span>
            <ListMusic className="w-4 h-4 text-primary" />
          </div>
          <p className="text-2xl font-bold text-white">4</p>
        </div>

        <div className="bg-surface/60 border border-white/5 p-5 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-medium">Speed Dial Slots</span>
            <Sliders className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-white">9 / 9</p>
        </div>

        <div className="bg-surface/60 border border-white/5 p-5 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-medium">Catalog Access</span>
            <Music2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-white">Unlimited</p>
        </div>
      </div>

      {/* Playback & Audio Preferences */}
      <div className="bg-surface/40 border border-white/5 rounded-3xl p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-white">Audio & Playback Settings</h2>
          </div>
          {savedSuccess && (
            <span className="text-xs text-emerald-400 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Preferences saved
            </span>
          )}
        </div>

        <div className="space-y-6 divide-y divide-white/5">
          {/* Audio Quality */}
          <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-white">Streaming Audio Quality</p>
              <p className="text-xs text-zinc-400 mt-0.5">Higher bitrate uses more data but delivers studio-grade clarity.</p>
            </div>
            <div className="flex items-center gap-2 bg-surface p-1 rounded-xl border border-white/10">
              {(["normal", "high", "lossless"] as const).map((q) => (
                <button
                  key={q}
                  onClick={() => { setQuality(q); handleSave(); }}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors",
                    quality === q ? "bg-primary text-white" : "text-zinc-400 hover:text-white"
                  )}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Loudness Normalization */}
          <div className="pt-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white">Audio Normalization</p>
              <p className="text-xs text-zinc-400 mt-0.5">Keep track volumes consistent across all songs.</p>
            </div>
            <button
              onClick={() => { setNormalizeAudio(!normalizeAudio); handleSave(); }}
              className={cn(
                "w-12 h-6 rounded-full transition-colors relative p-0.5 border border-white/10",
                normalizeAudio ? "bg-primary" : "bg-white/10"
              )}
            >
              <div
                className={cn(
                  "w-4 h-4 rounded-full bg-white transition-transform",
                  normalizeAudio ? "translate-x-6" : "translate-x-0"
                )}
              />
            </button>
          </div>

          {/* Autoplay Similar Songs */}
          <div className="pt-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white">Autoplay Endless Stream</p>
              <p className="text-xs text-zinc-400 mt-0.5">Automatically continue playing related music when queue ends.</p>
            </div>
            <button
              onClick={() => { setAutoplay(!autoplay); handleSave(); }}
              className={cn(
                "w-12 h-6 rounded-full transition-colors relative p-0.5 border border-white/10",
                autoplay ? "bg-primary" : "bg-white/10"
              )}
            >
              <div
                className={cn(
                  "w-4 h-4 rounded-full bg-white transition-transform",
                  autoplay ? "translate-x-6" : "translate-x-0"
                )}
              />
            </button>
          </div>
        </div>
      </div>

      {/* About Dhun */}
      <div className="p-6 rounded-2xl bg-surface/20 border border-white/5 flex items-center justify-between text-xs text-zinc-500">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-zinc-400" />
          <span>Dhun Web Player v1.0.0 • Multi-Pipe Architecture</span>
        </div>
        <span>Built with Next.js 15 & Express</span>
      </div>
    </div>
  );
}
