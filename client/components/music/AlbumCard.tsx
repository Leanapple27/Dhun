"use client";

import Link from "next/link";

interface AlbumCardProps {
  album: {
    id: string;
    title: string;
    artist: string;
    thumbnail: string;
    year?: string;
  };
}

export default function AlbumCard({ album }: AlbumCardProps) {
  const albumSlug = album.id || album.title;
  return (
    <Link 
      href={`/album/${encodeURIComponent(albumSlug)}?title=${encodeURIComponent(album.title)}&artist=${encodeURIComponent(album.artist)}`}
      className="bg-surface p-4 rounded-xl hover:bg-surface-hover transition-all hover:scale-[1.02] group cursor-pointer w-48 flex-shrink-0 block"
    >
      <div className="relative w-full aspect-square mb-4 rounded-lg overflow-hidden shadow-lg">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={album.thumbnail} 
          alt={album.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
        />
      </div>
      <h3 className="font-semibold text-white truncate text-base mb-1 group-hover:text-primary transition-colors">{album.title}</h3>
      <p className="text-sm text-zinc-400 truncate">{album.artist} • {album.year || "2024"}</p>
    </Link>
  );
}
