"use client";

import { useState } from "react";
import { usePlayerStore, Track } from "../../stores/playerStore";
import { usePlaylistStore } from "../../stores/playlistStore";
import TrackList from "../../components/music/TrackList";
import PlaylistImportModal from "../../components/playlist/PlaylistImportModal";
import { Heart, ListMusic, History, Play, Plus, Music, Upload, Sparkles, FolderPlus } from "lucide-react";
import { cn } from "../../lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState<"liked" | "playlists" | "history">("playlists");
  const { playHistory, play } = usePlayerStore();
  const { playlists, createPlaylist } = usePlaylistStore();
  const router = useRouter();

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Demo liked tracks
  const defaultLiked: Track[] = [
    { id: "Wqu4MRQOgyo", title: "Dhun (Saiyaara)", artist: "Arijit Singh", thumbnail: "https://i.ytimg.com/vi/Wqu4MRQOgyo/mqdefault.jpg", duration: 277 },
    { id: "NJAv_7lHUIU", title: "Kesariya", artist: "Arijit Singh, Pritam", thumbnail: "https://i.ytimg.com/vi/NJAv_7lHUIU/mqdefault.jpg", duration: 268 },
    { id: "YALvuUpY_b0", title: "Apna Bana Le", artist: "Arijit Singh, Sachin-Jigar", thumbnail: "https://i.ytimg.com/vi/YALvuUpY_b0/mqdefault.jpg", duration: 262 },
    { id: "4NRXx6U8ABQ", title: "Blinding Lights", artist: "The Weeknd", thumbnail: "https://i.ytimg.com/vi/4NRXx6U8ABQ/mqdefault.jpg", duration: 200 },
  ];

  const handleCreate = () => {
    const newId = createPlaylist();
    router.push(`/playlist/${newId}`);
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 pb-32">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">Your Library</h1>
          <p className="text-sm text-zinc-400 mt-1">Manage your custom playlists, imported albums, and favorites.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/15 hover:border-white text-xs font-bold text-white hover:bg-white/5 transition-all cursor-pointer"
          >
            <Upload className="w-4 h-4 text-emerald-400" />
            Import Playlist
          </button>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-5 py-2 rounded-full bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-lg transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Create Playlist
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3">
        <button
          onClick={() => setActiveTab("playlists")}
          className={cn(
            "flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer",
            activeTab === "playlists" ? "bg-white text-black scale-105" : "bg-surface/60 text-zinc-400 hover:text-white"
          )}
        >
          <ListMusic className="w-4 h-4" />
          Playlists ({playlists.length})
        </button>

        <button
          onClick={() => setActiveTab("liked")}
          className={cn(
            "flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer",
            activeTab === "liked" ? "bg-white text-black scale-105" : "bg-surface/60 text-zinc-400 hover:text-white"
          )}
        >
          <Heart className="w-4 h-4 text-pink-500 fill-current" />
          Liked Songs
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={cn(
            "flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer",
            activeTab === "history" ? "bg-white text-black scale-105" : "bg-surface/60 text-zinc-400 hover:text-white"
          )}
        >
          <History className="w-4 h-4 text-amber-400" />
          History ({playHistory.length})
        </button>
      </div>

      {/* Tab: Playlists */}
      {activeTab === "playlists" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {playlists.map((pl) => (
              <Link
                key={pl.id}
                href={`/playlist/${pl.id}`}
                className="bg-surface/40 hover:bg-surface border border-white/5 hover:border-white/15 rounded-2xl p-4 transition-all group flex flex-col justify-between aspect-square"
              >
                <div className="w-full aspect-square rounded-xl bg-[#282828] border border-white/5 flex items-center justify-center overflow-hidden mb-3">
                  {pl.cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={pl.cover} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  ) : (
                    <Music className="w-8 h-8 text-zinc-500" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-white truncate text-sm group-hover:text-primary transition-colors">
                    {pl.name}
                  </h3>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    {pl.tracks.length} {pl.tracks.length === 1 ? "song" : "songs"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Liked */}
      {activeTab === "liked" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400">{defaultLiked.length} tracks</span>
            <button
              onClick={() => play(defaultLiked[0])}
              className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-2 rounded-full text-xs font-bold shadow-lg transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Play All
            </button>
          </div>
          <div className="bg-surface/30 rounded-2xl overflow-hidden border border-white/5">
            <TrackList tracks={defaultLiked} />
          </div>
        </div>
      )}

      {/* Tab: History */}
      {activeTab === "history" && (
        <div className="space-y-4">
          {playHistory.length === 0 ? (
            <div className="py-20 text-center text-zinc-500 space-y-2">
              <History className="w-12 h-12 mx-auto stroke-[1.5]" />
              <p className="text-sm font-medium">No listening history yet. Start exploring tunes!</p>
            </div>
          ) : (
            <div className="bg-surface/30 rounded-2xl overflow-hidden border border-white/5">
              <TrackList tracks={playHistory} />
            </div>
          )}
        </div>
      )}

      <PlaylistImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />
    </div>
  );
}
