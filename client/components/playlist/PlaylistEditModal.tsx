"use client";

import { useState, useEffect } from "react";
import { X, Music, Lock, Globe, Upload, Image as ImageIcon } from "lucide-react";
import { Playlist } from "../../stores/playlistStore";

interface PlaylistEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  playlist: Playlist;
  onSave: (updates: Partial<Playlist>) => void;
}

export default function PlaylistEditModal({
  isOpen,
  onClose,
  playlist,
  onSave
}: PlaylistEditModalProps) {
  const [name, setName] = useState(playlist.name);
  const [description, setDescription] = useState(playlist.description);
  const [cover, setCover] = useState(playlist.cover || "");
  const [isPrivate, setIsPrivate] = useState(playlist.isPrivate || false);
  const [showUrlInput, setShowUrlInput] = useState(false);

  useEffect(() => {
    setName(playlist.name);
    setDescription(playlist.description);
    setCover(playlist.cover || "");
    setIsPrivate(playlist.isPrivate || false);
  }, [playlist]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: name.trim() || "Untitled Playlist",
      description: description.trim(),
      cover: cover.trim(),
      isPrivate
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div 
        role="dialog"
        aria-modal="true"
        aria-label="Edit playlist details"
        className="bg-[#282828] text-white w-full max-w-[540px] rounded-xl shadow-2xl overflow-hidden border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-2">
          <h2 className="text-xl font-bold tracking-tight">Edit details</h2>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="text-zinc-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 pt-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-4 items-start">
            {/* Left Cover Image Picker */}
            <div className="space-y-2">
              <div 
                onClick={() => setShowUrlInput(!showUrlInput)}
                className="w-full aspect-square rounded-lg bg-[#3e3e3e] hover:bg-[#484848] border border-white/5 flex flex-col items-center justify-center cursor-pointer relative overflow-hidden group shadow-lg transition-all"
                title="Click to change cover photo"
              >
                {cover ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={cover} alt="Cover" className="w-full h-full object-cover" />
                ) : (
                  <Music className="w-16 h-16 text-zinc-500 stroke-[1.2]" />
                )}

                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-xs font-semibold gap-1.5 transition-opacity">
                  <Upload className="w-6 h-6" />
                  <span>Choose photo</span>
                </div>
              </div>

              {showUrlInput && (
                <div className="animate-in fade-in duration-150 space-y-1">
                  <input
                    type="url"
                    placeholder="Paste image URL"
                    value={cover}
                    onChange={(e) => setCover(e.target.value)}
                    className="w-full bg-[#3e3e3e] border border-white/15 rounded-md px-2 py-1 text-[11px] text-white placeholder:text-zinc-500 focus:outline-none focus:border-white"
                  />
                  <div className="flex gap-1">
                    {[
                      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300",
                      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300",
                      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300"
                    ].map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setCover(preset)}
                        className="text-[10px] text-zinc-400 hover:text-white underline"
                      >
                        Preset {idx + 1}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Fields */}
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Playlist name"
                  required
                  className="w-full bg-[#3e3e3e] focus:bg-[#333333] border border-white/10 focus:border-white/40 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add an optional description"
                  rows={4}
                  className="w-full bg-[#3e3e3e] focus:bg-[#333333] border border-white/10 focus:border-white/40 rounded-lg p-3 text-sm text-white placeholder:text-zinc-500 focus:outline-none resize-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Disclaimer text matching Spotify reference screenshot */}
          <p className="text-[11px] text-zinc-400 leading-relaxed">
            By proceeding, you agree to give Dhun access to the image you choose to upload. Please make sure you have the right to upload the image.
          </p>

          {/* Bottom Actions Bar */}
          <div className="flex items-center justify-between pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={() => setIsPrivate(!isPrivate)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 hover:border-white/50 text-xs font-semibold text-white transition-colors"
            >
              {isPrivate ? <Lock className="w-3.5 h-3.5 text-amber-400" /> : <Globe className="w-3.5 h-3.5 text-primary" />}
              {isPrivate ? "Make public" : "Make private"}
            </button>

            <button
              type="submit"
              className="px-8 py-2.5 rounded-full bg-white text-black font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-lg cursor-pointer"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
