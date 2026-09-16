import axios from 'axios';
import { defaultPipedInstances } from '../config/piped';
import { PipedInstance } from '../types';
import { pipedService } from './pipedService';

export class MultiPipeRouter {
  private instances: PipedInstance[] = [];

  constructor() {
    this.instances = [...defaultPipedInstances];
  }

  addInstance(instance: PipedInstance) {
    this.instances.push(instance);
  }

  removeInstance(url: string) {
    this.instances = this.instances.filter(i => i.url !== url);
  }

  listInstances() {
    return this.instances;
  }

  async checkHealth() {
    for (const instance of this.instances) {
      try {
        const start = Date.now();
        // Check with lightweight search query
        await axios.get(`${instance.url}/search`, {
          params: { q: 'music', filter: 'music_songs' },
          timeout: 4000,
          headers: { 'User-Agent': 'Mozilla/5.0 Dhun/1.0' }
        });
        instance.active = true;
        (instance as any).latency = Date.now() - start;
      } catch (error) {
        // Fallback check root URL
        try {
          const start = Date.now();
          await axios.get(instance.url, {
            timeout: 3000,
            maxRedirects: 2,
            validateStatus: (status) => status < 400
          });
          instance.active = true;
          (instance as any).latency = Date.now() - start;
        } catch {
          instance.active = false;
        }
      }
    }
  }

  getHealthyInstance(): string {
    const healthy = this.instances.filter(i => i.active).sort((a, b) => (a as any).latency - (b as any).latency);
    if (healthy.length === 0) {
      // Return top configured instance as fallback
      return this.instances[0].url;
    }
    return healthy[0].url;
  }

  async fetchWithFailover<T>(operation: (url: string) => Promise<T>): Promise<T> {
    const candidates = [...this.instances].sort((a, b) => (a.active === b.active ? a.priority - b.priority : a.active ? -1 : 1));
    for (const instance of candidates) {
      try {
        return await operation(instance.url);
      } catch (error) {
        console.warn(`Instance ${instance.url} failed, trying next...`);
        instance.active = false;
      }
    }
    throw new Error('All piped instances failed');
  }

  async searchParallel(query: string, filter: 'music_songs' | 'music_albums' | 'music_artists' | 'all' = 'music_songs') {
    const targetFilter = filter === 'all' ? 'music_songs' : filter;
    const candidates = this.instances.slice(0, 3);

    const promises = candidates.map(instance =>
      pipedService.searchMusic(instance.url, query, targetFilter as any).catch(() => null)
    );

    const results = await Promise.all(promises);
    const validResults = results.filter(r => r !== null && (r.items || Array.isArray(r)));

    if (validResults.length === 0) {
      // Fallback try primary instance alone
      try {
        const fallback = await pipedService.searchMusic(this.instances[0].url, query, targetFilter as any);
        if (fallback?.items) validResults.push(fallback);
      } catch {
        throw new Error('Search failed on all instances');
      }
    }

    // Merge and deduplicate, normalize to Track interface
    const seen = new Set<string>();
    const merged: any[] = [];

    for (const result of validResults) {
      const items = result.items || (Array.isArray(result) ? result : []);
      for (const item of items) {
        const videoId = (item.url ? item.url.replace('/watch?v=', '') : item.videoId) || '';
        const id = videoId || item.id;
        if (id && !seen.has(id)) {
          seen.add(id);
          merged.push({
            id,
            videoId: id,
            title: item.title || item.name || 'Untitled',
            name: item.name || item.title || 'Untitled',
            artist: item.uploaderName || item.artist || item.name || 'Unknown Artist',
            thumbnail: item.thumbnail || item.thumbnailUrl || '',
            duration: item.duration || 0,
            uploaderUrl: item.uploaderUrl
          });
        }
      }
    }

    return merged;
  }

  async getStream(videoId: string) {
    return this.fetchWithFailover(async (url) => {
      const data = await pipedService.getStream(url, videoId);
      const audioStreams = data.audioStreams || [];
      const bestAudio = audioStreams.find((s: any) => s.mimeType?.includes('audio/mp4') || s.mimeType?.includes('audio/webm')) || audioStreams[0];
      return {
        url: bestAudio?.url || '',
        title: data.title,
        artist: data.uploader,
        thumbnail: data.thumbnailUrl,
        duration: data.duration,
        audioStreams
      };
    });
  }

  startHealthChecks() {
    this.checkHealth().catch(() => {});
    setInterval(() => this.checkHealth().catch(() => {}), 60000);
  }
}

export const multiPipeRouter = new MultiPipeRouter();
