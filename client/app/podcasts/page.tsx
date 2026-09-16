"use client";

import { useState } from "react";
import { usePlayerStore, Track } from "../../stores/playerStore";
import { Radio, Play, Sparkles, Clock, Calendar, Check, Mic2, Plus } from "lucide-react";
import { formatTime, cn } from "../../lib/utils";
import { usePlaylistStore } from "../../stores/playlistStore";

interface PodcastEpisode extends Track {
  podcastName: string;
  publishDate: string;
  description: string;
}

const podcastCategories = [
  "All",
  "Top Shows",
  "Tech & AI",
  "Self-Improvement",
  "Business & Finance",
  "Comedy",
  "Storytelling"
];

const podcastShows = [
  {
    id: "show-trs",
    name: "The Ranveer Show (TRS)",
    host: "Ranveer Allahbadia",
    category: "Self-Improvement",
    thumbnail: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=300",
    episodesCount: 340
  },
  {
    id: "show-huberman",
    name: "Huberman Lab",
    host: "Dr. Andrew Huberman",
    category: "Self-Improvement",
    thumbnail: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=300",
    episodesCount: 180
  },
  {
    id: "show-lex",
    name: "Lex Fridman Podcast",
    host: "Lex Fridman",
    category: "Tech & AI",
    thumbnail: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300",
    episodesCount: 420
  },
  {
    id: "show-raj",
    name: "Figuring Out",
    host: "Raj Shamani",
    category: "Business & Finance",
    thumbnail: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300",
    episodesCount: 220
  },
  {
    id: "show-finshots",
    name: "Finshots Daily",
    host: "Finshots Team",
    category: "Business & Finance",
    thumbnail: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=300",
    episodesCount: 500
  },
  {
    id: "show-rogan",
    name: "The Joe Rogan Experience",
    host: "Joe Rogan",
    category: "Comedy",
    thumbnail: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=300",
    episodesCount: 2100
  }
];

const initialEpisodes: PodcastEpisode[] = [
  {
    id: "pod-1",
    title: "How to Build High-Performance Habits & Focus in 2026",
    artist: "Dr. Andrew Huberman • Huberman Lab",
    podcastName: "Huberman Lab",
    thumbnail: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=300",
    duration: 3640,
    publishDate: "Yesterday",
    description: "Deep dive into neuroscience, neuroplasticity, dopamine management, and daily routines to maximize cognitive stamina."
  },
  {
    id: "pod-2",
    title: "The Future of Artificial Intelligence, Robotics, and Humanity",
    artist: "Lex Fridman Podcast",
    podcastName: "Lex Fridman Podcast",
    thumbnail: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300",
    duration: 4820,
    publishDate: "3 days ago",
    description: "Conversations on artificial general intelligence, neural networks, philosophy of mind, and space exploration."
  },
  {
    id: "pod-3",
    title: "Mastering Indian Startup Ecosystem & Wealth Creation",
    artist: "Raj Shamani • Figuring Out",
    podcastName: "Figuring Out",
    thumbnail: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300",
    duration: 2740,
    publishDate: "5 days ago",
    description: "Crucial insights into venture capital, business scaling, consumer psychology, and personal branding in modern India."
  },
  {
    id: "pod-4",
    title: "Spiritual Science, Meditation & Inner Resilience",
    artist: "The Ranveer Show (TRS)",
    podcastName: "The Ranveer Show (TRS)",
    thumbnail: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=300",
    duration: 3180,
    publishDate: "1 week ago",
    description: "Exploring ancient Vedic philosophies, deep meditation practices, mental resilience, and peak spiritual discipline."
  },
  {
    id: "pod-5",
    title: "Why Global Semiconductor Markets Are Transforming",
    artist: "Finshots Daily",
    podcastName: "Finshots Daily",
    thumbnail: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=300",
    duration: 640,
    publishDate: "Sep 12",
    description: "A quick 10-minute breakdown of microchip geopolitics, fab factories, and consumer tech economics."
  }
];

export default function PodcastsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const { play, currentTrack, isPlaying } = usePlayerStore();
  const { playlists, addTrackToPlaylist } = usePlaylistStore();
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  const filteredShows = podcastShows.filter((s) => {
    if (selectedCategory === "All" || selectedCategory === "Top Shows") return true;
    return s.category === selectedCategory;
  });

  const handleSaveToPlaylist = (episode: PodcastEpisode) => {
    const targetPl = playlists[0];
    if (targetPl) {
      addTrackToPlaylist(targetPl.id, episode);
      setAddedIds((prev) => new Set(prev).add(episode.id));
      setTimeout(() => {
        setAddedIds((prev) => {
          const next = new Set(prev);
          next.delete(episode.id);
          return next;
        });
      }, 2000);
    }
  };

  return (
    <div className="p-6 md:p-10 space-y-10 max-w-7xl mx-auto pb-32">
      {/* Podcast Hero Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-purple-900/40 via-surface to-surface p-8 md:p-12 border border-white/10 shadow-2xl overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-4 max-w-2xl text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
            <Radio className="w-3.5 h-3.5" />
            <span>Dhun Podcasts</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
            Feed Your Curiosity & Mind
          </h1>
          <p className="text-sm md:text-base text-zinc-300 leading-relaxed">
            Stream thought-provoking conversations, tech breakthroughs, business deep-dives, and motivational talks with background playback and speed control.
          </p>
        </div>

        <div className="w-40 h-40 md:w-48 md:h-48 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-2xl flex-shrink-0">
          <Mic2 className="w-20 h-20 stroke-[1.2]" />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {podcastCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={cn(
              "px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all shadow-sm cursor-pointer",
              selectedCategory === cat
                ? "bg-white text-black scale-105"
                : "bg-surface text-zinc-400 hover:text-white hover:bg-surface-hover"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Popular Shows */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            Top Podcast Shows
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredShows.map((show) => (
            <div
              key={show.id}
              className="bg-surface/50 hover:bg-surface/90 border border-white/5 hover:border-purple-500/30 p-4 rounded-2xl transition-all hover:scale-[1.02] cursor-pointer group flex flex-col justify-between"
            >
              <div className="w-full aspect-square rounded-xl overflow-hidden shadow-lg mb-3 bg-black/40">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={show.thumbnail} alt={show.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-purple-300 transition-colors">
                  {show.name}
                </h4>
                <p className="text-[11px] text-zinc-400 truncate mt-0.5">{show.host}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Latest Episodes List */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Radio className="w-5 h-5 text-primary" />
            Latest Episodes
          </h2>
        </div>

        <div className="space-y-3">
          {initialEpisodes.map((ep) => {
            const isPlayingThis = currentTrack?.id === ep.id && isPlaying;
            const isAdded = addedIds.has(ep.id);

            return (
              <div
                key={ep.id}
                className="bg-surface/30 hover:bg-surface/70 border border-white/5 hover:border-white/15 p-4 md:p-5 rounded-2xl transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group"
              >
                <div className="flex items-start gap-4 min-w-0 flex-1">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden shadow-md flex-shrink-0 bg-surface relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={ep.thumbnail} alt={ep.title} className="w-full h-full object-cover" />
                    <button
                      onClick={() => play(ep)}
                      className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Play className="w-6 h-6 fill-current ml-0.5" />
                    </button>
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2 text-[11px] text-purple-400 font-semibold uppercase tracking-wider">
                      <span>{ep.podcastName}</span>
                    </div>
                    <h3
                      onClick={() => play(ep)}
                      className="text-sm md:text-base font-bold text-white truncate cursor-pointer hover:text-primary transition-colors"
                    >
                      {ep.title}
                    </h3>
                    <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">{ep.description}</p>
                    <div className="flex items-center gap-4 text-[11px] text-zinc-500 pt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {ep.publishDate}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {Math.floor(ep.duration / 60)} min
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end md:self-center">
                  <button
                    onClick={() => handleSaveToPlaylist(ep)}
                    className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                    title="Add to library"
                  >
                    {isAdded ? <Check className="w-4 h-4 text-primary" /> : <Plus className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => play(ep)}
                    className={cn(
                      "flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold transition-all shadow-md cursor-pointer",
                      isPlayingThis
                        ? "bg-primary text-white"
                        : "bg-white text-black hover:scale-105 active:scale-95"
                    )}
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    {isPlayingThis ? "Playing" : "Play Episode"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
