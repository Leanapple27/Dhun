"use client";

import { use, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import TrackList from "../../../components/music/TrackList";
import { Track, usePlayerStore } from "../../../stores/playerStore";
import { searchMusic, getAlbum } from "../../../lib/api";
import { TrackListSkeleton } from "../../../components/common/LoadingSkeleton";
import { Play, Disc3, Clock, Heart } from "lucide-react";
import { formatTime } from "../../../lib/utils";

export default function AlbumPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const searchParams = useSearchParams();
  const albumTitleParam = searchParams.get("title") || decodeURIComponent(resolvedParams.id);
  const artistParam = searchParams.get("artist") || "Various Artists";

  const [albumTitle, setAlbumTitle] = useState(albumTitleParam);
  const [artist, setArtist] = useState(artistParam);
  const [cover, setCover] = useState("");
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);

  const { play } = usePlayerStore();

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const loadAlbumData = async () => {
      try {
        // Try fetching playlist if it looks like a playlist ID (starts with VL or PL)
        if (resolvedParams.id.startsWith("VL") || resolvedParams.id.startsWith("PL")) {
          try {
            const albumRes = await getAlbum(resolvedParams.id);
            if (albumRes?.data) {
              if (albumRes.data.name) setAlbumTitle(albumRes.data.name);
              if (albumRes.data.uploader) setArtist(albumRes.data.uploader);
              if (albumRes.data.thumbnailUrl) setCover(albumRes.data.thumbnailUrl);
              if (Array.isArray(albumRes.data.relatedStreams)) {
                setTracks(albumRes.data.relatedStreams);
                return;
              }
            }
          } catch {}
        }

        // Fallback: search for album tracks
        const query = `${albumTitleParam} ${artistParam}`.trim();
        const res = await searchMusic(query, "music_songs");
        if (!isMounted) return;

        const songList: Track[] = Array.isArray(res?.data) ? res.data : [];
        setTracks(songList);
        if (songList[0]?.thumbnail) {
          setCover(songList[0].thumbnail);
        }
      } catch (err) {
        console.warn("Error loading album details:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadAlbumData();
    return () => {
      isMounted = false;
    };
  }, [resolvedParams.id, albumTitleParam, artistParam]);

  const totalDuration = tracks.reduce((acc, t) => acc + (t.duration || 0), 0);

  const handlePlayAll = () => {
    if (tracks.length > 0) {
      play(tracks[0]);
    }
  };

  return (
    <div className="min-h-full pb-20">
      {/* Album Header Banner */}
      <div className="bg-gradient-to-b from-primary/30 via-surface to-background px-6 md:px-10 pt-10 pb-8 border-b border-white/5">
        <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
          <div className="w-44 h-44 md:w-56 md:h-56 rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex-shrink-0 bg-surface">
            {cover ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={cover} alt={albumTitle} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[#242424] text-zinc-600">
                <Disc3 className="w-16 h-16 animate-spin-slow" />
              </div>
            )}
          </div>

          <div className="space-y-3 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-semibold text-primary uppercase tracking-widest">
              <Disc3 className="w-4 h-4" />
              Album / Collection
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
              {albumTitle}
            </h1>
            <div className="flex items-center justify-center md:justify-start gap-3 text-sm text-zinc-300">
              <span className="font-semibold text-white">{artist}</span>
              <span>•</span>
              <span className="text-zinc-400">{tracks.length} Songs</span>
              <span>•</span>
              <span className="text-zinc-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {Math.floor(totalDuration / 60)} min
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="px-6 md:px-10 py-6 flex items-center gap-4">
        <button
          onClick={handlePlayAll}
          disabled={tracks.length === 0}
          className="w-14 h-14 rounded-full bg-primary hover:bg-primary-hover flex items-center justify-center text-white shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
          title="Play Album"
        >
          <Play className="w-6 h-6 fill-current ml-1" />
        </button>
      </div>

      {/* Album Tracklist */}
      <div className="px-6 md:px-10">
        {loading ? (
          <TrackListSkeleton />
        ) : (
          <div className="bg-surface/30 rounded-2xl overflow-hidden border border-white/5">
            <TrackList tracks={tracks} />
          </div>
        )}
      </div>
    </div>
  );
}
