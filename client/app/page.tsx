"use client";

import { useEffect, useState, useRef } from "react";
import {
  SpotifyQuickPickCard,
  SpotifyRadioCard,
  SpotifyDaylistCard,
  SpotifyChartCard,
  SpotifySquareCard,
  SpotifyArtistCircleCard,
} from "../components/music/SpotifyHomeCards";
import { Track, usePlayerStore } from "../stores/playerStore";
import { getTrending } from "../lib/api";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { cn } from "../lib/utils";
import Link from "next/link";

export default function Home() {
  const [daypartGreeting, setDaypartGreeting] = useState("Soundtrack your afternoon");
  const [mediaType, setMediaType] = useState<"all" | "music" | "podcasts">("all");
  const [trendingTracks, setTrendingTracks] = useState<Track[]>([]);
  const { play } = usePlayerStore();

  // Scroll helper for horizontal carousel rows
  const scrollRow = (elementId: string, direction: "left" | "right") => {
    const el = document.getElementById(elementId);
    if (el) {
      const scrollAmount = direction === "left" ? -400 : 400;
      el.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  useEffect(() => {
    const now = new Date();
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const dayName = days[now.getDay()];
    const hour = now.getHours();

    let part = "afternoon";
    if (hour < 12) part = "morning";
    else if (hour < 17) part = "afternoon";
    else if (hour < 22) part = "evening";
    else part = "night";

    setDaypartGreeting(`Soundtrack your ${dayName} ${part}`);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadLiveTrending = async () => {
      try {
        const res = await getTrending("IN", "india");
        if (isMounted && res?.data && Array.isArray(res.data) && res.data.length > 0) {
          setTrendingTracks(res.data);
        }
      } catch (err) {
        console.warn("Using offline catalog fallback for trending:", err);
      }
    };
    loadLiveTrending();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-full bg-[#121212] pb-24">
      {/* Top Ambient Burgundy/Red Glow matching Spotify Screenshots */}
      <div className="relative bg-gradient-to-b from-[#551214] via-[#240e10] to-[#121212] px-6 pt-4 pb-8 transition-colors duration-500">
        {/* Sticky Filter Pills (All / Music / Podcasts) */}
        <div className="flex items-center gap-2 mb-6">
          {(["all", "music", "podcasts"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setMediaType(type)}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs font-bold capitalize transition-all cursor-pointer",
                mediaType === type
                  ? "bg-white text-black shadow-md scale-105"
                  : "bg-white/10 text-white hover:bg-white/20"
              )}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Top Quick Access 2-Row Grid (Screenshots 1 & 2) */}
        {mediaType !== "podcasts" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
            <SpotifyQuickPickCard
              title="Scorpion"
              artist="Drake"
              image="https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=300"
              trackQuery="Drake Scorpion"
            />
            <SpotifyQuickPickCard
              title="Welcome To The Madhouse"
              artist="Tones And I"
              image="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300"
              trackQuery="Tones And I"
            />
            <SpotifyQuickPickCard
              title="Please Excuse Me for Being Antisocial"
              artist="Roddy Ricch"
              image="https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=300"
              trackQuery="Roddy Ricch The Box"
            />
            <SpotifyQuickPickCard
              title="Fine Line"
              artist="Harry Styles"
              image="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300"
              trackQuery="Harry Styles Fine Line"
            />
            <SpotifyQuickPickCard
              title="Feel Something"
              artist="Jaymes Young"
              image="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300"
              trackQuery="Jaymes Young Feel Something"
            />
            <SpotifyQuickPickCard
              title="You Want Some"
              artist="Jon Lajoie"
              image="https://images.unsplash.com/photo-1493225457124-a1a2a5f5646a?w=300"
              trackQuery="Jon Lajoie Everyday Normal Guy"
            />
            <SpotifyQuickPickCard
              title="Aashiqui 2"
              artist="Mithoon, Arijit Singh"
              image="https://i.ytimg.com/vi/fsiPzT50ZiM/mqdefault.jpg"
              trackQuery="Tum Hi Ho Aashiqui 2"
            />
            <SpotifyQuickPickCard
              title="The Box"
              artist="Roddy Ricch"
              image="https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=300"
              trackQuery="The Box Roddy Ricch"
            />
          </div>
        )}
      </div>

      {/* Main Content Sections */}
      <div className="px-6 space-y-9 -mt-2">
        {/* ========================================================
            SECTION 1: Dynamic Daypart & Artist Radio (Screenshot 2 & 4)
            ======================================================== */}
        {mediaType !== "podcasts" && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {daypartGreeting}
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => scrollRow("row-soundtrack", "left")}
                  className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/80 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => scrollRow("row-soundtrack", "right")}
                  className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/80 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <Link
                  href="/search?q=radio"
                  className="text-xs font-bold text-zinc-400 hover:text-white hover:underline transition-colors ml-1"
                >
                  Show all
                </Link>
              </div>
            </div>

            <div
              id="row-soundtrack"
              className="flex gap-4 overflow-x-auto pb-2 scrollbar-none scroll-smooth"
            >
              <SpotifyDaylistCard />

              <SpotifyRadioCard
                artistName="Jon Lajoie"
                subtitle="With SoulChef, Dr. Dre, Snoop Dogg and more"
                bgHex="#facc15"
                artistImages={[
                  "https://images.unsplash.com/photo-1493225457124-a1a2a5f5646a?w=200",
                  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
                  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200",
                ]}
              />

              <SpotifyRadioCard
                artistName="Harry Styles"
                subtitle="With sombr, Olivia Rodrigo, Sabrina Carpenter and more"
                bgHex="#fb923c"
                artistImages={[
                  "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200",
                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200",
                  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200",
                ]}
              />

              <SpotifyRadioCard
                artistName="Drake"
                subtitle="With J. Cole, DJ Khaled, PARTYNEXTDOOR and Future"
                bgHex="#f472b6"
                artistImages={[
                  "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=200",
                  "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=200",
                  "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200",
                ]}
              />

              <SpotifyRadioCard
                artistName="Jaymes Young"
                subtitle="With Duncan Laurence, Chord Overstreet, Ruth B. and more"
                bgHex="#6ee7b7"
                artistImages={[
                  "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200",
                  "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=200",
                  "https://images.unsplash.com/photo-1520523839898-50712825e617?w=200",
                ]}
              />

              <SpotifyRadioCard
                artistName="Shreya Ghoshal"
                subtitle="With Vishal-Shekhar, A.R. Rahman, Atif Aslam and Pritam"
                bgHex="#f87171"
                artistImages={[
                  "https://images.unsplash.com/photo-1520523839898-50712825e617?w=200",
                  "https://i.ytimg.com/vi/Wqu4MRQOgyo/mqdefault.jpg",
                  "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200",
                ]}
              />

              <SpotifyRadioCard
                artistName="Sidhu Moose Wala"
                subtitle="With Shubh, Prem Dhillon, AP Dhillon and Karan Aujla"
                bgHex="#38bdf8"
                artistImages={[
                  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
                  "https://images.unsplash.com/photo-1493225457124-a1a2a5f5646a?w=200",
                  "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=200",
                ]}
              />
            </div>
          </section>
        )}

        {/* ========================================================
            SECTION 2: Featured Charts (Screenshot 1)
            ======================================================== */}
        {mediaType !== "podcasts" && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Featured Charts
              </h2>
              <Link
                href="/search?q=charts"
                className="text-xs font-bold text-zinc-400 hover:text-white hover:underline transition-colors"
              >
                Show all
              </Link>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
              <SpotifyChartCard
                title="Top Songs"
                country="Global"
                gradientClass="bg-gradient-to-br from-[#7c3aed] to-[#312e81]"
                typeBadge="Weekly Music Charts"
                subtitle="Your weekly update of the most played tracks right now - Global."
              />

              <SpotifyChartCard
                title="Top Songs"
                country="India"
                gradientClass="bg-gradient-to-br from-[#ea580c] to-[#991b1b]"
                typeBadge="Weekly Music Charts"
                subtitle="Your weekly update of the most played tracks right now - India."
              />

              <SpotifyChartCard
                title="Top 50"
                country="India"
                gradientClass="bg-gradient-to-br from-[#65a30d] to-[#14532d]"
                typeBadge="Top 50"
                subtitle="Your daily update of the most played tracks right now - India."
              />

              <SpotifyChartCard
                title="Top 50"
                country="Global"
                gradientClass="bg-gradient-to-br from-[#0284c7] to-[#0c4a6e]"
                typeBadge="Top 50"
                subtitle="Your daily update of the most played tracks right now - Global."
              />
            </div>
          </section>
        )}

        {/* ========================================================
            SECTION 3: Popular albums and singles (Screenshot 3)
            ======================================================== */}
        {mediaType !== "podcasts" && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Popular albums and singles
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => scrollRow("row-albums", "left")}
                  className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/80 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => scrollRow("row-albums", "right")}
                  className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/80 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <Link
                  href="/search?q=album"
                  className="text-xs font-bold text-zinc-400 hover:text-white hover:underline transition-colors ml-1"
                >
                  Show all
                </Link>
              </div>
            </div>

            <div
              id="row-albums"
              className="flex gap-4 overflow-x-auto pb-2 scrollbar-none scroll-smooth"
            >
              <SpotifySquareCard
                id="alb-aashiqui-2"
                albumId="Aashiqui 2"
                title="Aashiqui 2"
                subtitle="Mithoon, Ankit Tiwari, Jeet Gannguli"
                image="https://i.ytimg.com/vi/fsiPzT50ZiM/mqdefault.jpg"
              />

              <SpotifySquareCard
                id="alb-finding-her"
                albumId="Finding Her"
                title="Finding Her"
                subtitle="Kushagra, Bharath, Saaheal"
                image="https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400"
              />

              <SpotifySquareCard
                id="alb-sanam-teri-kasam"
                albumId="Sanam Teri Kasam"
                title="Sanam Teri Kasam (Original Motion...)"
                subtitle="Himesh Reshammiya, Sameer Anjaan"
                image="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400"
              />

              <SpotifySquareCard
                id="alb-raanjhan"
                albumId="Raanjhan"
                title="Raanjhan (From 'Do Patti')"
                subtitle="Sachet-Parampara, Parampara Tandon"
                image="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400"
              />

              <SpotifySquareCard
                id="alb-arijit-love"
                albumId="Ultimate Love Songs"
                title="Ultimate Love Songs - Arijit Singh"
                subtitle="Arijit Singh"
                image="https://i.ytimg.com/vi/Wqu4MRQOgyo/mqdefault.jpg"
              />

              <SpotifySquareCard
                id="alb-yjhd"
                albumId="Yeh Jawaani Hai Deewani"
                title="Yeh Jawaani Hai Deewani"
                subtitle="Pritam"
                image="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400"
              />

              <SpotifySquareCard
                id="alb-kabir-singh"
                albumId="Kabir Singh"
                title="Kabir Singh"
                subtitle="Sachet-Parampara, Mithoon, Vishal Mishra"
                image="https://i.ytimg.com/vi/2mxh4KZw_-c/mqdefault.jpg"
              />
            </div>
          </section>
        )}

        {/* ========================================================
            SECTION 4: Based on your recent listening (Screenshot 4)
            ======================================================== */}
        {mediaType !== "podcasts" && (
          <section>
            <div className="flex items-center justify-between mb-1">
              <div>
                <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider block">
                  Inspired by your recent activity
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Based on your recent listening
                </h2>
              </div>
              <Link
                href="/library"
                className="text-xs font-bold text-zinc-400 hover:text-white hover:underline transition-colors"
              >
                Show all
              </Link>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none pt-2">
              <SpotifySquareCard
                id="mix-ultimate-hit"
                title="The Ultimate Hit Mix"
                subtitle="Mixing the decades: 1990s, 2000s, 2010s and 2020s."
                image="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400"
                showSpotifyLogo
              />

              <SpotifySquareCard
                id="mix-most-streamed"
                title="Most Streamed Songs of all time"
                subtitle="Celebrate the most streamed anthems in global streaming history."
                image="https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400"
                showSpotifyLogo
              />

              <SpotifySquareCard
                id="mix-viral-throwbacks"
                title="Top Viral Throwbacks"
                subtitle="The songs with the biggest throwback power right now."
                image="https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=400"
                showSpotifyLogo
              />

              <SpotifySquareCard
                id="mix-all-out-2020s"
                title="All Out 2020s"
                subtitle="The biggest songs of the 2020s. Non-stop modern pop & hip-hop."
                image="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400"
                showSpotifyLogo
              />

              <SpotifySquareCard
                id="mix-matchday-gavi"
                title="My Matchday Songs: Gavi"
                subtitle="Check out favorite high-energy pre-match anthems by Barça's Gavi."
                image="https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=400"
                showSpotifyLogo
              />

              <SpotifySquareCard
                id="mix-billions-club"
                title="Billions Club"
                subtitle="Celebrating all tracks with over 1 Billion streams worldwide."
                image="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400"
                showSpotifyLogo
              />
            </div>
          </section>
        )}

        {/* ========================================================
            SECTION 5: Workout & Motivation (Screenshot 5)
            ======================================================== */}
        {mediaType !== "podcasts" && (
          <section>
            <div className="flex items-center justify-between mb-1">
              <div>
                <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider block">
                  Music to keep you motivated
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Workout
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => scrollRow("row-workout", "left")}
                  className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/80 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => scrollRow("row-workout", "right")}
                  className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/80 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <Link
                  href="/search?q=workout"
                  className="text-xs font-bold text-zinc-400 hover:text-white hover:underline transition-colors ml-1"
                >
                  Show all
                </Link>
              </div>
            </div>

            <div
              id="row-workout"
              className="flex gap-4 overflow-x-auto pb-2 scrollbar-none scroll-smooth pt-2"
            >
              <SpotifySquareCard
                id="wo-retro-running"
                title="Retro Running"
                subtitle="Up for a nostalgic running session? High-BPM synthwave & 80s beats."
                image="https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400"
                showSpotifyLogo
              />

              <SpotifySquareCard
                id="wo-workout"
                title="Workout"
                subtitle="Pop hits and club bangers to keep your workout fresh and intense."
                image="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400"
                showSpotifyLogo
              />

              <SpotifySquareCard
                id="wo-make-moves"
                title="Make Moves"
                subtitle="Spotify & Nike present Make Moves: inspiring daily fitness journeys."
                image="https://images.unsplash.com/photo-1483721074573-5a7a7b8e1a12?w=400"
                showSpotifyLogo
              />

              <SpotifySquareCard
                id="wo-lets-golf"
                title="Let's Golf!"
                subtitle="The ultimate golf companion playlist for calm focus on the greens."
                image="https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=400"
                showSpotifyLogo
              />

              <SpotifySquareCard
                id="wo-powerwalk"
                title="Powerwalk!"
                subtitle="Fuel your powerwalk with these upbeat and brisk tempo rhythms."
                image="https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=400"
                showSpotifyLogo
              />

              <SpotifySquareCard
                id="wo-espn-plays"
                title="ESPN Top Plays"
                subtitle="Music for the biggest stage in basketball, athletics and sports."
                image="https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400"
                showSpotifyLogo
              />
            </div>
          </section>
        )}

        {/* ========================================================
            SECTION 6: Popular Artists (Screenshot 5)
            ======================================================== */}
        {mediaType !== "podcasts" && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Popular artists
              </h2>
              <Link
                href="/search?q=artist"
                className="text-xs font-bold text-zinc-400 hover:text-white hover:underline transition-colors"
              >
                Show all
              </Link>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
              <SpotifyArtistCircleCard
                name="Arijit Singh"
                image="https://i.ytimg.com/vi/Wqu4MRQOgyo/mqdefault.jpg"
              />
              <SpotifyArtistCircleCard
                name="Shreya Ghoshal"
                image="https://images.unsplash.com/photo-1520523839898-50712825e617?w=400"
              />
              <SpotifyArtistCircleCard
                name="Sidhu Moose Wala"
                image="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400"
              />
              <SpotifyArtistCircleCard
                name="Diljit Dosanjh"
                image="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400"
              />
              <SpotifyArtistCircleCard
                name="Yo Yo Honey Singh"
                image="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400"
              />
              <SpotifyArtistCircleCard
                name="Harry Styles"
                image="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400"
              />
              <SpotifyArtistCircleCard
                name="Drake"
                image="https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400"
              />
              <SpotifyArtistCircleCard
                name="Taylor Swift"
                image="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400"
              />
            </div>
          </section>
        )}

        {/* ========================================================
            SECTION 7: Podcasts Hub (when Podcasts pill is active or All)
            ======================================================== */}
        {(mediaType === "all" || mediaType === "podcasts") && (
          <section className="pt-2">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                <span>Top Podcasts & Talk Shows</span>
              </h2>
              <Link
                href="/podcasts"
                className="text-xs font-bold text-zinc-400 hover:text-white hover:underline transition-colors"
              >
                Show all
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {[
                {
                  id: "pod-1",
                  name: "The Ranveer Show",
                  host: "Ranveer Allahbadia",
                  img: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=300",
                },
                {
                  id: "pod-2",
                  name: "Huberman Lab",
                  host: "Dr. Andrew Huberman",
                  img: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=300",
                },
                {
                  id: "pod-3",
                  name: "Lex Fridman Podcast",
                  host: "Lex Fridman",
                  img: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300",
                },
                {
                  id: "pod-4",
                  name: "Figuring Out",
                  host: "Raj Shamani",
                  img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300",
                },
                {
                  id: "pod-5",
                  name: "Finshots Daily",
                  host: "Finshots Team",
                  img: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=300",
                },
              ].map((pod) => (
                <Link
                  key={pod.id}
                  href="/podcasts"
                  className="p-4 rounded-lg bg-[#181818]/60 hover:bg-[#282828] transition-all duration-300 group cursor-pointer block relative"
                >
                  <div className="w-full aspect-square rounded-md overflow-hidden shadow-lg mb-3 bg-zinc-900 relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={pod.img}
                      alt={pod.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        play({
                          id: pod.id,
                          title: pod.name,
                          artist: pod.host,
                          thumbnail: pod.img,
                          duration: 3600,
                          streamUrl: "",
                        });
                      }}
                      className="absolute bottom-2 right-2 w-11 h-11 rounded-full bg-[#1ed760] hover:bg-[#20e266] text-black flex items-center justify-center shadow-2xl opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:scale-105 z-20"
                    >
                      <Play className="w-5 h-5 fill-black ml-0.5" />
                    </button>
                  </div>
                  <h4 className="font-bold text-sm text-white truncate group-hover:text-primary transition-colors">
                    {pod.name}
                  </h4>
                  <p className="text-xs text-zinc-400 truncate mt-0.5">{pod.host}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
