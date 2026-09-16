"use client";

import { useState } from "react";
import { X, Download, FileSpreadsheet, FileCode, Copy, Check, Share2, Music } from "lucide-react";
import { Playlist } from "../../stores/playlistStore";

interface PlaylistExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  playlist: Playlist;
}

export default function PlaylistExportModal({ isOpen, onClose, playlist }: PlaylistExportModalProps) {
  const [copiedType, setCopiedType] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    const link = `${window.location.origin}/playlist/${playlist.id}`;
    navigator.clipboard.writeText(link);
    setCopiedType("link");
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleCopyText = () => {
    const text = playlist.tracks
      .map((t, idx) => `${idx + 1}. ${t.title} - ${t.artist}`)
      .join("\n");
    navigator.clipboard.writeText(text);
    setCopiedType("text");
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleDownloadCSV = () => {
    const headers = "Track Name,Artist Name,Duration (s),Video ID\n";
    const rows = playlist.tracks
      .map((t) => `"${t.title.replace(/"/g, '""')}","${t.artist.replace(/"/g, '""')}",${t.duration || 0},"${t.id}"`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${playlist.name.replace(/\s+/g, "_")}_dhun.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadJSON = () => {
    const data = JSON.stringify(playlist, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${playlist.name.replace(/\s+/g, "_")}_dhun.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div 
        role="dialog"
        aria-modal="true"
        aria-label="Export and Share Playlist"
        className="bg-[#242424] text-white w-full max-w-[480px] rounded-2xl shadow-2xl overflow-hidden border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold">Export & Share Playlist</h2>
          </div>
          <button onClick={onClose} aria-label="Close modal" className="text-zinc-400 hover:text-white p-1 rounded-full hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Playlist Summary */}
        <div className="p-6 space-y-5">
          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
            <div className="w-12 h-12 rounded-lg bg-surface flex items-center justify-center overflow-hidden flex-shrink-0">
              {playlist.cover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={playlist.cover} alt="" className="w-full h-full object-cover" />
              ) : (
                <Music className="w-6 h-6 text-zinc-500" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-bold text-white truncate">{playlist.name}</h4>
              <p className="text-xs text-zinc-400">{playlist.tracks.length} tracks</p>
            </div>
          </div>

          {/* Export Options */}
          <div className="space-y-2">
            <button
              onClick={handleDownloadCSV}
              className="w-full flex items-center justify-between p-3.5 rounded-xl bg-[#1c1c1c] hover:bg-white/10 border border-white/5 hover:border-white/15 transition-all text-left group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Export to CSV</p>
                  <p className="text-[11px] text-zinc-400">Compatible with Spotify, Apple Music, and TuneMyMusic</p>
                </div>
              </div>
              <Download className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
            </button>

            <button
              onClick={handleDownloadJSON}
              className="w-full flex items-center justify-between p-3.5 rounded-xl bg-[#1c1c1c] hover:bg-white/10 border border-white/5 hover:border-white/15 transition-all text-left group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                  <FileCode className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Export to JSON</p>
                  <p className="text-[11px] text-zinc-400">Complete raw backup of Dhun playlist metadata</p>
                </div>
              </div>
              <Download className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
            </button>

            <button
              onClick={handleCopyText}
              className="w-full flex items-center justify-between p-3.5 rounded-xl bg-[#1c1c1c] hover:bg-white/10 border border-white/5 hover:border-white/15 transition-all text-left group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <Copy className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Copy Song List as Text</p>
                  <p className="text-[11px] text-zinc-400">Numbered artist and title list to paste anywhere</p>
                </div>
              </div>
              {copiedType === "text" ? (
                <span className="text-xs text-primary font-semibold flex items-center gap-1">
                  <Check className="w-4 h-4" /> Copied
                </span>
              ) : (
                <Copy className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
              )}
            </button>

            <button
              onClick={handleCopyLink}
              className="w-full flex items-center justify-between p-3.5 rounded-xl bg-[#1c1c1c] hover:bg-white/10 border border-white/5 hover:border-white/15 transition-all text-left group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Share Playlist Link</p>
                  <p className="text-[11px] text-zinc-400">Direct URL to view this playlist in Dhun</p>
                </div>
              </div>
              {copiedType === "link" ? (
                <span className="text-xs text-primary font-semibold flex items-center gap-1">
                  <Check className="w-4 h-4" /> Copied
                </span>
              ) : (
                <Share2 className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3 bg-white/[0.02] border-t border-white/10">
          <button
            onClick={onClose}
            className="px-5 py-1.5 rounded-full text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
