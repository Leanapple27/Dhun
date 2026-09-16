import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Track } from "./playerStore";

export interface Playlist {
  id: string;
  name: string;
  description: string;
  cover?: string;
  isPrivate?: boolean;
  isFolder?: boolean;
  isBlend?: boolean;
  tracks: Track[];
  createdAt: string;
  updatedAt: string;
}

const defaultPlaylists: Playlist[] = [
  {
    id: "favorites",
    name: "Favorites",
    description: "Your all-time favorite melodies and most played anthems.",
    cover: "https://i.ytimg.com/vi/Wqu4MRQOgyo/mqdefault.jpg",
    isPrivate: false,
    tracks: [
      { id: "Wqu4MRQOgyo", title: "Dhun (Saiyaara)", artist: "Arijit Singh", thumbnail: "https://i.ytimg.com/vi/Wqu4MRQOgyo/mqdefault.jpg", duration: 277 },
      { id: "NJAv_7lHUIU", title: "Kesariya", artist: "Arijit Singh, Pritam", thumbnail: "https://i.ytimg.com/vi/NJAv_7lHUIU/mqdefault.jpg", duration: 268 },
      { id: "YALvuUpY_b0", title: "Apna Bana Le", artist: "Arijit Singh, Sachin-Jigar", thumbnail: "https://i.ytimg.com/vi/YALvuUpY_b0/mqdefault.jpg", duration: 262 },
      { id: "fsiPzT50ZiM", title: "Tum Hi Ho", artist: "Arijit Singh, Mithoon", thumbnail: "https://i.ytimg.com/vi/fsiPzT50ZiM/mqdefault.jpg", duration: 262 },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "workout",
    name: "Workout Energy",
    description: "High-octane energetic beats to power through your workout sessions.",
    cover: "https://i.ytimg.com/vi/4NRXx6U8ABQ/mqdefault.jpg",
    isPrivate: false,
    tracks: [
      { id: "4NRXx6U8ABQ", title: "Blinding Lights", artist: "The Weeknd", thumbnail: "https://i.ytimg.com/vi/4NRXx6U8ABQ/mqdefault.jpg", duration: 200 },
      { id: "TUVcZfQe-Kw", title: "Levitating", artist: "Dua Lipa", thumbnail: "https://i.ytimg.com/vi/TUVcZfQe-Kw/mqdefault.jpg", duration: 203 },
      { id: "34Na4j8AVgA", title: "Starboy", artist: "The Weeknd", thumbnail: "https://i.ytimg.com/vi/34Na4j8AVgA/mqdefault.jpg", duration: 230 },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "chill-vibes",
    name: "Chill Vibes",
    description: "Relax, unwind, and soothe your mind with warm acoustic tunes.",
    cover: "https://i.ytimg.com/vi/JGwWNGJdvx8/mqdefault.jpg",
    isPrivate: false,
    tracks: [
      { id: "JGwWNGJdvx8", title: "Shape of You", artist: "Ed Sheeran", thumbnail: "https://i.ytimg.com/vi/JGwWNGJdvx8/mqdefault.jpg", duration: 233 },
      { id: "Wqu4MRQOgyo", title: "Dhun (Saiyaara)", artist: "Arijit Singh", thumbnail: "https://i.ytimg.com/vi/Wqu4MRQOgyo/mqdefault.jpg", duration: 277 },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "focus",
    name: "Focus & Code",
    description: "Deep concentration soundtracks for coding, study, and creative flow.",
    cover: "https://i.ytimg.com/vi/NJAv_7lHUIU/mqdefault.jpg",
    isPrivate: false,
    tracks: [
      { id: "NJAv_7lHUIU", title: "Kesariya", artist: "Arijit Singh, Pritam", thumbnail: "https://i.ytimg.com/vi/NJAv_7lHUIU/mqdefault.jpg", duration: 268 },
      { id: "YALvuUpY_b0", title: "Apna Bana Le", artist: "Arijit Singh", thumbnail: "https://i.ytimg.com/vi/YALvuUpY_b0/mqdefault.jpg", duration: 262 },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

interface PlaylistState {
  playlists: Playlist[];
  createPlaylist: (name?: string, description?: string, cover?: string, isBlend?: boolean, isFolder?: boolean) => string;
  updatePlaylist: (id: string, updates: Partial<Playlist>) => void;
  deletePlaylist: (id: string) => void;
  addTrackToPlaylist: (playlistId: string, track: Track) => boolean;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => void;
  importPlaylist: (data: { name: string; description?: string; cover?: string; tracks: Track[] }) => string;
  getPlaylist: (id: string) => Playlist | undefined;
}

export const usePlaylistStore = create<PlaylistState>()(
  persist(
    (set, get) => ({
      playlists: defaultPlaylists,

      createPlaylist: (name, description, cover, isBlend = false, isFolder = false) => {
        const count = get().playlists.filter(p => p.name.startsWith("My Playlist")).length + 1;
        const newId = `pl-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        const newPlaylist: Playlist = {
          id: newId,
          name: name || `My Playlist #${count}`,
          description: description || (isBlend ? "A blended mix of shared favorite tunes." : "Add an optional description"),
          cover: cover || "",
          isPrivate: false,
          isBlend,
          isFolder,
          tracks: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        set((state) => ({
          playlists: [newPlaylist, ...state.playlists]
        }));

        return newId;
      },

      updatePlaylist: (id, updates) => {
        set((state) => ({
          playlists: state.playlists.map((p) =>
            p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
          )
        }));
      },

      deletePlaylist: (id) => {
        set((state) => ({
          playlists: state.playlists.filter((p) => p.id !== id)
        }));
      },

      addTrackToPlaylist: (playlistId, track) => {
        const target = get().playlists.find((p) => p.id === playlistId);
        if (!target) return false;

        // Check if track is already in playlist
        const exists = target.tracks.some((t) => t.id === track.id || (t as any).videoId === track.id);
        if (exists) return false;

        set((state) => ({
          playlists: state.playlists.map((p) =>
            p.id === playlistId
              ? {
                  ...p,
                  cover: p.cover || track.thumbnail,
                  tracks: [...p.tracks, track],
                  updatedAt: new Date().toISOString()
                }
              : p
          )
        }));
        return true;
      },

      removeTrackFromPlaylist: (playlistId, trackId) => {
        set((state) => ({
          playlists: state.playlists.map((p) =>
            p.id === playlistId
              ? {
                  ...p,
                  tracks: p.tracks.filter((t) => t.id !== trackId && (t as any).videoId !== trackId),
                  updatedAt: new Date().toISOString()
                }
              : p
          )
        }));
      },

      importPlaylist: ({ name, description, cover, tracks }) => {
        const newId = `import-${Date.now()}`;
        const importedPlaylist: Playlist = {
          id: newId,
          name: name || "Imported Playlist",
          description: description || `Imported with ${tracks.length} tracks.`,
          cover: cover || tracks[0]?.thumbnail || "",
          isPrivate: false,
          tracks,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        set((state) => ({
          playlists: [importedPlaylist, ...state.playlists]
        }));

        return newId;
      },

      getPlaylist: (id) => {
        return get().playlists.find((p) => p.id === id);
      }
    }),
    {
      name: "dhun_user_playlists"
    }
  )
);
