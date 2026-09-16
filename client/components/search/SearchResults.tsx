"use client";

import { useState, useEffect } from "react";
import TrackList from "../music/TrackList";
import AlbumCard from "../music/AlbumCard";
import ArtistCard from "../music/ArtistCard";
import { Track, usePlayerStore } from "../../stores/playerStore";
import { searchMusic } from "../../lib/api";
import { TrackListSkeleton } from "../common/LoadingSkeleton";
import { Play, Music, Disc3, Mic2, AlertCircle } from "lucide-react";
import { cn } from "../../lib/utils";

interface SearchResultsProps {
  query: string;
}

export default function SearchResults({ query }: SearchResultsProps) {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [albums, setAlbums] = useState<any[]>([]);
  const [artists, setArtists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "songs" | "albums" | "artists">("all");
  const { play } = usePlayerStore();

  useEffect(() => {
    if (!query.trim()) return;

    let isMounted = true;
    setLoading(true);
    setError("");

    const fetchAll = async () => {
      try {
        // Fetch songs
        const songsPromise = searchMusic(query, "music_songs").catch(() => ({ data: [] }));
        // Fetch albums
        const albumsPromise = searchMusic(query, "music_albums").catch(() => ({ data: [] }));
        // Fetch artists
        const artistsPromise = searchMusic(query, "music_artists").catch(() => ({ data: [] }));

        const [songsRes, albumsRes, artistsRes] = await Promise.all([
          songsPromise,
          albumsPromise,
          artistsPromise
        ]);

        if (!isMounted) return;

        const songList: Track[] = Array.isArray(songsRes?.data) ? songsRes.data : [];
        const albumList = Array.isArray(albumsRes?.data) ? albumsRes.data : [];
        const artistList = Array.isArray(artistsRes?.data) ? artistsRes.data : [];

        setTracks(songList);
        setAlbums(albumList);
        setArtists(artistList);

        if (songList.length === 0 && albumList.length === 0 && artistList.length === 0) {
          setError(`No results found for "${query}". Try searching for another song or artist.`);
        }
      } catch (err: any) {
        if (isMounted) {
          setError("Failed to fetch search results from music catalog. Please try again.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchAll();

    return () => {
      isMounted = false;
    };
  }, [query]);

  if (loading) {
    return (
      <div className="space-y-6 pt-4">
        <div className="flex items-center gap-2">
          <div className="w-20 h-8 bg-white/5 animate-pulse rounded-full" />
          <div className="w-20 h-8 bg-white/5 animate-pulse rounded-full" />
          <div className="w-20 h-8 bg-white/5 animate-pulse rounded-full" />
        </div>
        <TrackListSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-zinc-500 mx-auto stroke-[1.5]" />
        <h3 className="text-xl font-semibold text-white">No matches found</h3>
        <p className="text-sm text-zinc-400 max-w-md mx-auto">{error}</p>
      </div>
    );
  }

  const topTrack = tracks[0];

  return (
    <div className="space-y-8">
      {/* Category Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {(["all", "songs", "albums", "artists"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-4 py-1.5 rounded-full text-xs font-semibold capitalize transition-colors",
              filter === f
                ? "bg-white text-black shadow-md"
                : "bg-surface text-zinc-400 hover:text-white hover:bg-surface-hover"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Top Result + Songs Section */}
      {(filter === "all" || filter === "songs") && tracks.length > 0 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6">
            {/* Top Match Card */}
            {topTrack && filter === "all" && (
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-white">Top Result</h3>
                <div 
                  onClick={() => play(topTrack)}
                  className="bg-surface/50 hover:bg-surface/90 border border-white/5 hover:border-primary/40 transition-all p-6 rounded-2xl cursor-pointer group flex flex-col justify-between h-[240px] shadow-xl relative"
                >
                  <div className="w-20 h-20 rounded-xl overflow-hidden shadow-lg mb-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={topTrack.thumbnail || "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=150"}
                      alt={topTrack.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>

                  <div>
                    <h4 className="text-2xl font-bold text-white truncate group-hover:text-primary transition-colors">
                      {topTrack.title}
                    </h4>
                    <p className="text-sm text-zinc-400 truncate mt-1">
                      Song • <span className="text-zinc-200">{topTrack.artist}</span>
                    </p>
                  </div>

                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      play(topTrack);
                    }}
                    className="absolute bottom-6 right-6 w-12 h-12 rounded-full bg-primary hover:bg-primary-hover flex items-center justify-center text-white shadow-xl opacity-0 group-hover:opacity-100 hover:scale-110 transition-all"
                  >
                    <Play className="w-6 h-6 fill-current ml-0.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Song Results List */}
            <div className={cn("space-y-3", filter === "songs" ? "col-span-2" : "")}>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Music className="w-5 h-5 text-primary" />
                Songs
              </h3>
              <div className="bg-surface/30 rounded-2xl overflow-hidden border border-white/5">
                <TrackList tracks={filter === "all" ? tracks.slice(0, 5) : tracks} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Albums Section */}
      {(filter === "all" || filter === "albums") && albums.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Disc3 className="w-5 h-5 text-primary" />
            Albums
          </h3>
          <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {albums.map((album, idx) => (
              <AlbumCard
                key={album.id || idx}
                album={{
                  id: album.id || String(idx),
                  title: album.title || album.name || "Album",
                  artist: album.artist || album.uploaderName || "Various Artists",
                  thumbnail: album.thumbnail || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300"
                }}
              />
            ))}
          </div>
        </section>
      )}

      {/* Artists Section */}
      {(filter === "all" || filter === "artists") && artists.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Mic2 className="w-5 h-5 text-primary" />
            Artists
          </h3>
          <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {artists.map((artist, idx) => (
              <ArtistCard
                key={artist.id || idx}
                artist={{
                  id: artist.id || String(idx),
                  name: artist.name || artist.title || "Artist",
                  thumbnail: artist.thumbnail || "https://images.unsplash.com/photo-1493225457124-a1a2a5f5646a?w=300"
                }}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
