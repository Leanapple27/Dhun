"use client";

import { use, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import TrackList from "../../../components/music/TrackList";
import AlbumCard from "../../../components/music/AlbumCard";
import { Track, usePlayerStore } from "../../../stores/playerStore";
import { searchMusic, getArtist } from "../../../lib/api";
import { TrackListSkeleton } from "../../../components/common/LoadingSkeleton";
import { Play, Sparkles, Disc3, Mic2, Heart, Users } from "lucide-react";

export default function ArtistPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const searchParams = useSearchParams();
  const artistNameParam = searchParams.get("name") || decodeURIComponent(resolvedParams.id);

  const [artistName, setArtistName] = useState(artistNameParam);
  const [avatar, setAvatar] = useState("https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400");
  const [tracks, setTracks] = useState<Track[]>([]);
  const [albums, setAlbums] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  const { play } = usePlayerStore();

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const loadArtistData = async () => {
      try {
        // Try fetching channel if it's a channel ID
        if (resolvedParams.id.startsWith("UC") || resolvedParams.id.startsWith("/")) {
          try {
            const channelRes = await getArtist(resolvedParams.id);
            if (channelRes?.data) {
              if (channelRes.data.name) setArtistName(channelRes.data.name);
              if (channelRes.data.avatarUrl) setAvatar(channelRes.data.avatarUrl);
            }
          } catch {}
        }

        // Fetch top tracks and albums for this artist
        const [songsRes, albumsRes] = await Promise.all([
          searchMusic(artistNameParam, "music_songs").catch(() => ({ data: [] })),
          searchMusic(artistNameParam, "music_albums").catch(() => ({ data: [] }))
        ]);

        if (!isMounted) return;

        const songList: Track[] = Array.isArray(songsRes?.data) ? songsRes.data : [];
        const albumList: any[] = Array.isArray(albumsRes?.data) ? albumsRes.data : [];

        setTracks(songList);
        setAlbums(albumList);

        if (songList[0]?.thumbnail && (!avatar || avatar.includes("unsplash"))) {
          setAvatar(songList[0].thumbnail);
        }
      } catch (err) {
        console.warn("Error loading artist details:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadArtistData();
    return () => {
      isMounted = false;
    };
  }, [resolvedParams.id, artistNameParam]);

  const handlePlayAll = () => {
    if (tracks.length > 0) {
      play(tracks[0]);
    }
  };

  return (
    <div className="min-h-full pb-20">
      {/* Artist Hero Banner */}
      <div className="relative h-64 md:h-80 bg-gradient-to-b from-primary/30 via-surface to-background px-6 md:px-10 flex flex-col justify-end pb-8 border-b border-white/5">
        <div className="flex flex-col md:flex-row md:items-end gap-6 z-10">
          <div className="w-28 h-28 md:w-44 md:h-44 rounded-full overflow-hidden shadow-2xl border-4 border-white/10 flex-shrink-0 bg-surface">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={avatar} alt={artistName} className="w-full h-full object-cover" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-widest">
              <Mic2 className="w-4 h-4" />
              Verified Artist
            </div>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white tracking-tight">
              {artistName}
            </h1>
            <div className="flex items-center gap-4 text-xs md:text-sm text-zinc-400">
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4 text-zinc-500" />
                Monthly Chart Topper
              </span>
              <span>•</span>
              <span>{tracks.length} Top Releases</span>
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
          title="Play Popular"
        >
          <Play className="w-6 h-6 fill-current ml-1" />
        </button>

        <button
          onClick={() => setIsFollowing(!isFollowing)}
          className={`px-5 py-2.5 rounded-full text-xs font-semibold border transition-all ${
            isFollowing
              ? "bg-white text-black border-white"
              : "border-white/20 text-white hover:border-white/40 hover:bg-white/5"
          }`}
        >
          {isFollowing ? "Following" : "Follow"}
        </button>
      </div>

      {/* Content Sections */}
      <div className="px-6 md:px-10 space-y-10">
        {/* Popular Tracks */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Popular Releases
          </h2>
          {loading ? (
            <TrackListSkeleton />
          ) : (
            <div className="bg-surface/30 rounded-2xl overflow-hidden border border-white/5">
              <TrackList tracks={tracks.slice(0, 10)} />
            </div>
          )}
        </section>

        {/* Albums & Discography */}
        {albums.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Disc3 className="w-5 h-5 text-primary" />
              Discography & Singles
            </h2>
            <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {albums.map((album, idx) => (
                <AlbumCard
                  key={album.id || idx}
                  album={{
                    id: album.id || String(idx),
                    title: album.title || album.name || "Album",
                    artist: artistName,
                    thumbnail: album.thumbnail || avatar
                  }}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
