import axios from 'axios';
import { PipedStreamResponse } from '../types';

const client = axios.create({
  timeout: 7000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json'
  }
});

export const pipedService = {
  async searchMusic(instanceUrl: string, query: string, filter: 'music_songs' | 'music_albums' | 'music_artists' | 'all' = 'music_songs'): Promise<any> {
    const response = await client.get(`${instanceUrl}/search`, {
      params: { q: query, filter }
    });
    return response.data;
  },

  async getStream(instanceUrl: string, videoId: string): Promise<PipedStreamResponse> {
    const response = await client.get(`${instanceUrl}/streams/${videoId}`);
    return response.data;
  },

  async getTrending(instanceUrl: string, region: string = 'IN'): Promise<any> {
    try {
      const response = await client.get(`${instanceUrl}/trending`, {
        params: { region }
      });
      return response.data;
    } catch {
      // Fallback search trending if endpoint fails
      const fallback = await client.get(`${instanceUrl}/search`, {
        params: { q: 'Top Hits', filter: 'music_songs' }
      });
      return fallback.data?.items || [];
    }
  },

  async getPlaylist(instanceUrl: string, playlistId: string): Promise<any> {
    const response = await client.get(`${instanceUrl}/playlists/${playlistId}`);
    return response.data;
  },

  async getChannel(instanceUrl: string, channelId: string): Promise<any> {
    const response = await client.get(`${instanceUrl}/channel/${channelId}`);
    return response.data;
  }
};
