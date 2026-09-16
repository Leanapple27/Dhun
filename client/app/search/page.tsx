"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import SearchResults from "../../components/search/SearchResults";
import { Search } from "lucide-react";

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="p-6 md:p-8 min-h-full">
      {query ? (
        <SearchResults query={query} />
      ) : (
        <div className="space-y-8">
          <h1 className="text-3xl font-bold">Browse All</h1>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {[
              { name: "Pop", color: "bg-pink-500", query: "Pop Hits" },
              { name: "Hip-Hop", color: "bg-orange-500", query: "Hip Hop Hits" },
              { name: "Rock", color: "bg-red-500", query: "Rock Classics" },
              { name: "Electronic", color: "bg-blue-500", query: "Electronic Dance Music" },
              { name: "Bollywood", color: "bg-amber-600", query: "Bollywood Hits" },
              { name: "Punjabi", color: "bg-teal-500", query: "Punjabi Hits" },
              { name: "Indie", color: "bg-indigo-500", query: "Indie Pop" },
              { name: "R&B", color: "bg-purple-500", query: "R&B Hits" },
              { name: "Acoustic", color: "bg-yellow-600", query: "Acoustic Chill" },
              { name: "Workout", color: "bg-emerald-500", query: "Workout Motivation Music" }
            ].map((genre) => (
              <Link
                key={genre.name} 
                href={`/search?q=${encodeURIComponent(genre.query)}`}
                className={`${genre.color} aspect-square rounded-2xl p-5 relative overflow-hidden group cursor-pointer hover:scale-105 transition-all shadow-lg flex flex-col justify-between`}
              >
                <h3 className="text-xl font-bold text-white z-10 relative">{genre.name}</h3>
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-black/20 rounded-full rotate-45 transform group-hover:scale-110 transition-transform flex items-center justify-center">
                  <Search className="w-8 h-8 text-white/50" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-8 text-zinc-400">Loading search...</div>}>
      <SearchContent />
    </Suspense>
  );
}
