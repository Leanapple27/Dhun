"use client";

import { use, useState, useEffect, useCallback } from "react";
import { usePlaylistStore, Playlist } from "../../../stores/playlistStore";
import { usePlayerStore, Track } from "../../../stores/playerStore";
import { useAuthStore } from "../../../stores/authStore";
import TrackList from "../../../components/music/TrackList";
import PlaylistEditModal from "../../../components/playlist/PlaylistEditModal";
import PlaylistExportModal from "../../../components/playlist/PlaylistExportModal";
import PlaylistImportModal from "../../../components/playlist/PlaylistImportModal";
import { searchMusic } from "../../../lib/api";
import { debounce, formatTime } from "../../../lib/utils";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  Play,
  Plus,
  Edit3,
  MoreHorizontal,
  Search,
  X,
  Music,
  Clock,
  Share2,
  Trash2,
  Upload,
  Check,
  List,
  Sparkles,
  Lock,
  Globe
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function PlaylistPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuthStore();
  const {
    playlists,
    updatePlaylist,
    deletePlaylist,
    addTrackToPlaylist,
    removeTrackFromPlaylist
  } = usePlaylistStore();
  const { play } = usePlayerStore();

  const playlist = playlists.find((p) => p.id === id) || {
    id,
    name: id.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    description: "Curated collection of your favorite sounds.",
    cover: "",
    isPrivate: false,
    tracks: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [addedTrackIds, setAddedTrackIds] = useState<Set<string>>(new Set());

  // Debounced search for "Let's find something for your playlist"
  const handleSearch = useCallback(
    debounce(async (q: string) => {
      if (q.trim().length > 1) {
        setIsSearching(true);
        try {
          const res = await searchMusic(q.trim(), "music_songs");
          if (Array.isArray(res?.data)) {
            setSearchResults(res.data.slice(0, 10));
          }
        } catch {
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 300),
    []
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    handleSearch(val);
  };

  const handleAddTrack = (track: Track) => {
    addTrackToPlaylist(playlist.id, track);
    setAddedTrackIds((prev) => new Set(prev).add(track.id));
    setTimeout(() => {
      setAddedTrackIds((prev) => {
        const next = new Set(prev);
        next.delete(track.id);
        return next;
      });
    }, 2000);
  };

  const handleDeletePlaylist = () => {
    if (confirm(`Are you sure you want to delete "${playlist.name}"?`)) {
      deletePlaylist(playlist.id);
      router.push("/library");
    }
  };

  const totalDuration = playlist.tracks.reduce((acc, t) => acc + (t.duration || 0), 0);

  return (
    <div className="min-h-full pb-32">
      {/* Dynamic Spotify-style Gradient Header */}
      <div className="bg-gradient-to-b from-[#333333] via-[#1c1c1c] to-[#121212] px-6 md:px-10 pt-10 pb-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 max-w-7xl mx-auto">
          {/* Cover Art Box with Edit Overlay (Screenshot 3 & 2) */}
          <div
            onClick={() => setIsEditOpen(true)}
            className="w-48 h-48 md:w-56 md:h-56 rounded-lg bg-[#282828] hover:bg-[#323232] border border-white/10 shadow-2xl flex items-center justify-center flex-shrink-0 cursor-pointer relative overflow-hidden group transition-all"
            title="Click to edit details"
          >
            {playlist.cover ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={playlist.cover} alt={playlist.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
            ) : (
              <Music className="w-20 h-20 text-zinc-500 stroke-[1]" />
            )}

            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-xs font-bold gap-2 transition-opacity">
              <Edit3 className="w-8 h-8" />
              <span>Choose photo</span>
            </div>
          </div>

          {/* Header Metadata */}
          <div className="space-y-3 text-center sm:text-left flex-1 min-w-0">
            <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 justify-center sm:justify-start">
              {playlist.isPrivate ? <Lock className="w-3.5 h-3.5 text-amber-400" /> : <Globe className="w-3.5 h-3.5 text-primary" />}
              {playlist.isPrivate ? "Private Playlist" : "Public Playlist"}
            </span>

            <h1
              onClick={() => setIsEditOpen(true)}
              className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tight truncate cursor-pointer hover:underline decoration-white/30"
              title="Click to rename"
            >
              {playlist.name}
            </h1>

            {playlist.description && (
              <p className="text-sm text-zinc-400 line-clamp-2 max-w-2xl">{playlist.description}</p>
            )}

            <div className="flex items-center justify-center sm:justify-start gap-2 text-xs md:text-sm text-zinc-300 pt-1">
              <span className="font-bold text-white flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-black">
                  +
                </span>
                {user?.username || "Dhun User"}
              </span>
              <span>•</span>
              <span>{playlist.tracks.length} {playlist.tracks.length === 1 ? "song" : "songs"}</span>
              {totalDuration > 0 && (
                <>
                  <span>•</span>
                  <span className="text-zinc-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {formatTime(totalDuration)}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar (Screenshot 3) */}
      <div className="px-6 md:px-10 py-6 max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {playlist.tracks.length > 0 && (
            <button
              onClick={() => play(playlist.tracks[0])}
              className="w-14 h-14 rounded-full bg-primary hover:bg-primary-hover flex items-center justify-center text-white shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
              title="Play Playlist"
            >
              <Play className="w-6 h-6 fill-current ml-1" />
            </button>
          )}

          {/* Add Shortcut */}
          <button
            onClick={() => {
              const el = document.getElementById("playlist-search-box");
              el?.focus();
              el?.scrollIntoView({ behavior: "smooth" });
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 hover:border-white text-xs font-bold text-white hover:bg-white/5 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>

          {/* Name & details (Edit details button matching Screenshot 3) */}
          <button
            onClick={() => setIsEditOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 hover:border-white text-xs font-bold text-white hover:bg-white/5 transition-all cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Name & details
          </button>

          {/* More Options Dropdown */}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="text-zinc-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors">
                <MoreHorizontal className="w-6 h-6" />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="min-w-[200px] bg-[#282828] border border-white/10 rounded-xl p-1.5 shadow-2xl z-50 text-xs text-zinc-200"
                sideOffset={5}
              >
                <DropdownMenu.Item
                  onClick={() => setIsExportOpen(true)}
                  className="flex items-center gap-2.5 px-3 py-2 hover:bg-white/10 rounded-lg cursor-pointer outline-none"
                >
                  <Share2 className="w-4 h-4 text-primary" />
                  Export & Share (CSV / JSON)
                </DropdownMenu.Item>

                <DropdownMenu.Item
                  onClick={() => setIsImportOpen(true)}
                  className="flex items-center gap-2.5 px-3 py-2 hover:bg-white/10 rounded-lg cursor-pointer outline-none"
                >
                  <Upload className="w-4 h-4 text-emerald-400" />
                  Import from YT Music / Spotify
                </DropdownMenu.Item>

                <DropdownMenu.Separator className="h-px bg-white/10 my-1" />

                <DropdownMenu.Item
                  onClick={handleDeletePlaylist}
                  className="flex items-center gap-2.5 px-3 py-2 text-red-400 hover:bg-red-500/10 rounded-lg cursor-pointer outline-none"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Playlist
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 text-xs text-zinc-400 font-medium">
          <List className="w-4 h-4" />
          <span>List</span>
        </div>
      </div>

      {/* Playlist Tracklist */}
      <div className="px-6 md:px-10 max-w-7xl mx-auto mb-12">
        {playlist.tracks.length > 0 ? (
          <div className="bg-surface/20 rounded-2xl overflow-hidden border border-white/5">
            <TrackList tracks={playlist.tracks} />
          </div>
        ) : (
          <div className="py-12 text-center space-y-2 border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
            <Music className="w-12 h-12 text-zinc-600 mx-auto" />
            <h3 className="text-base font-semibold text-white">This playlist is empty</h3>
            <p className="text-xs text-zinc-400">Search below to add songs or episodes to your playlist.</p>
          </div>
        )}
      </div>

      {/* "Let's find something for your playlist" section (Screenshot 2 & 3) */}
      <div className="px-6 md:px-10 max-w-7xl mx-auto space-y-6 pt-6 border-t border-white/10">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Let&apos;s find something for your playlist
          </h2>
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSearchResults([]);
              }}
              className="text-xs text-zinc-400 hover:text-white flex items-center gap-1"
            >
              <X className="w-4 h-4" /> Clear
            </button>
          )}
        </div>

        {/* Search Input Box matching Screenshot 2 & 3 */}
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            id="playlist-search-box"
            type="text"
            placeholder="Search for songs or episodes"
            value={searchQuery}
            onChange={handleInputChange}
            className="w-full bg-[#242424] hover:bg-[#2a2a2a] focus:bg-[#2a2a2a] border border-white/10 focus:border-white/30 rounded-lg py-3 pl-11 pr-10 text-sm text-white placeholder:text-zinc-500 focus:outline-none transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSearchResults([]);
              }}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Live Search Results with inline "Add" button */}
        {isSearching ? (
          <div className="py-8 text-center text-xs text-zinc-400">Searching music catalog...</div>
        ) : searchResults.length > 0 ? (
          <div className="space-y-1 bg-[#181818] p-2 rounded-2xl border border-white/5 divide-y divide-white/5">
            {searchResults.map((track) => {
              const isAdded = addedTrackIds.has(track.id);
              const alreadyInPlaylist = playlist.tracks.some((t) => t.id === track.id);

              return (
                <div
                  key={track.id}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-surface">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={track.thumbnail} alt={track.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-white truncate group-hover:text-primary transition-colors">
                        {track.title}
                      </p>
                      <p className="text-xs text-zinc-400 truncate">{track.artist}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-xs text-zinc-400 hidden sm:inline">{formatTime(track.duration)}</span>
                    <button
                      onClick={() => handleAddTrack(track)}
                      disabled={alreadyInPlaylist}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                        isAdded
                          ? "bg-primary text-white border-primary"
                          : alreadyInPlaylist
                          ? "bg-transparent text-zinc-500 border-zinc-700 cursor-not-allowed"
                          : "border-white/30 text-white hover:border-white hover:scale-105 active:scale-95"
                      }`}
                    >
                      {isAdded ? (
                        <span className="flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Added
                        </span>
                      ) : alreadyInPlaylist ? (
                        "In playlist"
                      ) : (
                        "Add"
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : searchQuery ? (
          <p className="text-xs text-zinc-400 py-4">No tracks found for &quot;{searchQuery}&quot;.</p>
        ) : null}
      </div>

      {/* Modals */}
      <PlaylistEditModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        playlist={playlist}
        onSave={(updates) => updatePlaylist(playlist.id, updates)}
      />

      <PlaylistExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        playlist={playlist}
      />

      <PlaylistImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
      />
    </div>
  );
}
