"use client";

import { useState } from "react";
import { X, Video, Music2, FileText, Upload, Sparkles, Check, AlertCircle, Loader2 } from "lucide-react";
import { searchMusic } from "../../lib/api";
import { usePlaylistStore } from "../../stores/playlistStore";
import { useRouter } from "next/navigation";
import { cn } from "../../lib/utils";

interface PlaylistImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PlaylistImportModal({ isOpen, onClose }: PlaylistImportModalProps) {
  const [activeTab, setActiveTab] = useState<"yt" | "spotify" | "text">("yt");
  const [urlInput, setUrlInput] = useState("");
  const [textInput, setTextInput] = useState("");
  const [playlistName, setPlaylistName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [previewTracks, setPreviewTracks] = useState<any[]>([]);

  const { importPlaylist } = usePlaylistStore();
  const router = useRouter();

  if (!isOpen) return null;

  const handleImportYT = async () => {
    if (!urlInput.trim()) {
      setError("Please enter a valid YouTube or YouTube Music playlist link.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Extract playlist ID from URL or raw ID
      let listId = urlInput.trim();
      const match = urlInput.match(/[?&]list=([^#&?]+)/);
      if (match) {
        listId = match[1];
      }

      // Query multi-pipe backend album/playlist endpoint
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
      const res = await fetch(`${API_URL}/music/album/${encodeURIComponent(listId)}`);
      const data = await res.json();

      let tracks: any[] = [];
      let name = playlistName.trim() || data?.data?.name || "Imported YouTube Playlist";
      let cover = data?.data?.thumbnailUrl || "";

      if (data?.success && Array.isArray(data.data?.relatedStreams)) {
        tracks = data.data.relatedStreams.map((item: any) => ({
          id: (item.url ? item.url.replace("/watch?v=", "") : item.id) || item.videoId,
          title: item.title || "Untitled",
          artist: item.uploaderName || item.artist || "Unknown Artist",
          thumbnail: item.thumbnail || cover,
          duration: item.duration || 0
        }));
      }

      // If backend playlist query had no related streams, fallback to searching the title or query
      if (tracks.length === 0) {
        const searchRes = await searchMusic(urlInput.replace(/https?:\/\/[^\s]+/g, "") || "Trending Hits", "music_songs");
        if (Array.isArray(searchRes?.data) && searchRes.data.length > 0) {
          tracks = searchRes.data.slice(0, 15);
        }
      }

      if (tracks.length === 0) {
        throw new Error("Could not find playable tracks in this playlist.");
      }

      const newId = importPlaylist({
        name,
        description: `Imported from YouTube Music (${tracks.length} tracks)`,
        cover: cover || tracks[0]?.thumbnail,
        tracks
      });

      onClose();
      router.push(`/playlist/${newId}`);
    } catch (err: any) {
      setError(err.message || "Failed to import YouTube playlist. Please check the link.");
    } finally {
      setLoading(false);
    }
  };

  const handleImportTextOrSpotify = async () => {
    const rawContent = textInput.trim();
    if (!rawContent) {
      setError("Please paste a tracklist or Spotify song lines (e.g. Artist - Song).");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const lines = rawContent
        .split("\n")
        .map((l) => l.trim().replace(/^\d+[\.\)]\s*/, "")) // remove numbering like "1. "
        .filter((l) => l.length > 2)
        .slice(0, 25); // import up to 25 tracks at once

      if (lines.length === 0) {
        throw new Error("No valid track names found in input.");
      }

      // Search matching tracks in parallel across our catalog
      const searchPromises = lines.map(async (line) => {
        try {
          const res = await searchMusic(line, "music_songs");
          return res?.data?.[0] || null;
        } catch {
          return null;
        }
      });

      const matchedResults = await Promise.all(searchPromises);
      const validTracks = matchedResults.filter((t) => t !== null);

      if (validTracks.length === 0) {
        throw new Error("Could not match any tracks from the input in the music catalog.");
      }

      const newId = importPlaylist({
        name: playlistName.trim() || "Imported Spotify Playlist",
        description: `Imported playlist with ${validTracks.length} matched songs.`,
        cover: validTracks[0]?.thumbnail || "",
        tracks: validTracks
      });

      onClose();
      router.push(`/playlist/${newId}`);
    } catch (err: any) {
      setError(err.message || "Failed to import tracks.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div 
        role="dialog"
        aria-modal="true"
        aria-label="Import Playlist"
        className="bg-[#242424] text-white w-full max-w-[560px] rounded-2xl shadow-2xl overflow-hidden border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold">Import Playlist to Dhun</h2>
          </div>
          <button onClick={onClose} aria-label="Close modal" className="text-zinc-400 hover:text-white p-1 rounded-full hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-white/10 px-6 pt-2 bg-white/[0.02]">
          <button
            onClick={() => { setActiveTab("yt"); setError(""); }}
            className={cn(
              "flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-colors",
              activeTab === "yt" ? "border-primary text-white" : "border-transparent text-zinc-400 hover:text-zinc-200"
            )}
          >
            <Video className="w-4 h-4 text-red-500" />
            YouTube / YT Music
          </button>
          <button
            onClick={() => { setActiveTab("spotify"); setError(""); }}
            className={cn(
              "flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-colors",
              activeTab === "spotify" ? "border-primary text-white" : "border-transparent text-zinc-400 hover:text-zinc-200"
            )}
          >
            <Music2 className="w-4 h-4 text-emerald-400" />
            Spotify / Apple Music
          </button>
          <button
            onClick={() => { setActiveTab("text"); setError(""); }}
            className={cn(
              "flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-colors",
              activeTab === "text" ? "border-primary text-white" : "border-transparent text-zinc-400 hover:text-zinc-200"
            )}
          >
            <FileText className="w-4 h-4 text-amber-400" />
            Text / CSV List
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-300">Playlist Name (Optional)</label>
            <input
              type="text"
              placeholder="e.g. My Favorite Bangers"
              value={playlistName}
              onChange={(e) => setPlaylistName(e.target.value)}
              className="w-full bg-[#181818] border border-white/10 focus:border-primary/50 rounded-xl px-3.5 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none"
            />
          </div>

          {activeTab === "yt" ? (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-300">YouTube or YouTube Music Playlist URL</label>
              <input
                type="url"
                placeholder="https://music.youtube.com/playlist?list=..."
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="w-full bg-[#181818] border border-white/10 focus:border-primary/50 rounded-xl px-3.5 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none"
              />
              <p className="text-[11px] text-zinc-400">
                Paste any public YouTube Music or YouTube playlist link. Dhun will extract the songs and build your playlist instantly.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-300">Paste Tracklist or Song Names</label>
              <textarea
                placeholder={"Arijit Singh - Kesariya\nThe Weeknd - Blinding Lights\nEd Sheeran - Shape of You"}
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                rows={5}
                className="w-full bg-[#181818] border border-white/10 focus:border-primary/50 rounded-xl p-3 text-xs text-white placeholder:text-zinc-500 focus:outline-none resize-none font-mono"
              />
              <p className="text-[11px] text-zinc-400">
                Tip: Paste one song per line or copy export text from Spotify, Apple Music, or Soundiiz. Dhun will automatically find high quality audio matches.
              </p>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-white/[0.02] border-t border-white/10">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-full text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={activeTab === "yt" ? handleImportYT : handleImportTextOrSpotify}
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-lg transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {loading ? "Importing Tracks..." : "Import to Dhun"}
          </button>
        </div>
      </div>
    </div>
  );
}
