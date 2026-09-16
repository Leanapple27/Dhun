"use client";

import Link from "next/link";

interface ArtistCardProps {
  artist: {
    id: string;
    name: string;
    thumbnail: string;
  };
}

export default function ArtistCard({ artist }: ArtistCardProps) {
  const artistSlug = artist.id || artist.name;
  return (
    <Link 
      href={`/artist/${encodeURIComponent(artistSlug)}?name=${encodeURIComponent(artist.name)}`}
      className="bg-surface p-4 rounded-xl hover:bg-surface-hover transition-all hover:scale-[1.02] group cursor-pointer w-48 flex-shrink-0 flex flex-col items-center text-center block"
    >
      <div className="relative w-full aspect-square mb-4 rounded-full overflow-hidden shadow-xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={artist.thumbnail} 
          alt={artist.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
        />
      </div>
      <h3 className="font-semibold text-white truncate text-base mb-1 w-full group-hover:text-primary transition-colors">{artist.name}</h3>
      <p className="text-sm text-zinc-400 capitalize">Artist</p>
    </Link>
  );
}
