import axios from "axios";
import { useAuthStore } from "../stores/authStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("dhun_token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export const searchMusic = async (query: string, filter?: string) => {
  const params = new URLSearchParams({ q: query });
  if (filter) params.set('filter', filter);
  const res = await api.get(`/music/search?${params.toString()}`);
  return res.data;
};

export const getSearchSuggestions = async (query: string): Promise<string[]> => {
  if (!query || !query.trim()) return [];
  try {
    const res = await api.get(`/music/suggestions?q=${encodeURIComponent(query.trim())}`);
    return Array.isArray(res.data?.data) ? res.data.data : [];
  } catch {
    return [];
  }
};

export const getStream = async (videoId: string) => {
  const res = await api.get(`/music/stream/${videoId}`);
  // Return the audio stream URL from the Piped response
  return res.data?.data || res.data;
};

export const getTrending = async (region = 'IN', category = 'india') => {
  const res = await api.get(`/music/trending?region=${region}&category=${category}`);
  return res.data;
};

export const getArtist = async (id: string) => {
  const res = await api.get(`/music/artist/${id}`);
  return res.data;
};

export const getAlbum = async (id: string) => {
  const res = await api.get(`/music/album/${id}`);
  return res.data;
};

export const getLyrics = async (videoId: string, title?: string, artist?: string, duration?: number) => {
  const params = new URLSearchParams();
  if (title) params.set('title', title);
  if (artist) params.set('artist', artist);
  if (duration) params.set('duration', String(duration));
  const queryStr = params.toString() ? `?${params.toString()}` : '';
  const res = await api.get(`/lyrics/${videoId}${queryStr}`);
  return res.data;
};

export default api;
