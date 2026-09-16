import axios from 'axios';

const lrclibClient = axios.create({
  timeout: 5000,
  headers: {
    'User-Agent': 'DhunMusicApp/1.0 (https://localhost:3000)',
    'Accept': 'application/json'
  }
});

function cleanTrackTitle(title: string): string {
  if (!title) return '';
  return title
    .replace(/\(Official.*?\)/gi, '')
    .replace(/\[Official.*?\]/gi, '')
    .replace(/\(Audio.*?\)/gi, '')
    .replace(/\[Audio.*?\]/gi, '')
    .replace(/\(Lyric.*?\)/gi, '')
    .replace(/\[Lyric.*?\]/gi, '')
    .replace(/\(Music Video.*?\)/gi, '')
    .replace(/\[Music Video.*?\]/gi, '')
    .replace(/\(Visualizer.*?\)/gi, '')
    .replace(/\(From\s*".*?"\)/gi, '')
    .replace(/\[From\s*".*?"\]/gi, '')
    .replace(/\(feat\..*?\)/gi, '')
    .replace(/\[feat\..*?\]/gi, '')
    .replace(/\(ft\..*?\)/gi, '')
    .replace(/\[ft\..*?\]/gi, '')
    .replace(/\|.*$/g, '')
    .replace(/ - .*Video.*/gi, '')
    .trim();
}

function cleanArtistName(artist: string): string {
  if (!artist) return '';
  let cleaned = artist
    .replace(/ - Topic/gi, '')
    .replace(/VEVO/gi, '')
    .trim();
  
  if (cleaned.includes(',')) {
    cleaned = cleaned.split(',')[0].trim();
  } else if (cleaned.includes('&')) {
    cleaned = cleaned.split('&')[0].trim();
  } else if (cleaned.toLowerCase().includes(' feat. ')) {
    cleaned = cleaned.split(/ feat\. /i)[0].trim();
  }
  return cleaned;
}

export const lyricsService = {
  async fetchLyrics(rawTitle: string, rawArtist: string, duration?: number): Promise<{ syncedLyrics: string | null; plainLyrics: string | null }> {
    const cleanTitle = cleanTrackTitle(rawTitle);
    const cleanArtist = cleanArtistName(rawArtist);

    // 1. Try exact LRCLIB get
    try {
      const getRes = await lrclibClient.get('https://lrclib.net/api/get', {
        params: {
          track_name: cleanTitle,
          artist_name: cleanArtist,
          ...(duration ? { duration: Math.round(duration) } : {})
        }
      });
      if (getRes.data?.syncedLyrics || getRes.data?.plainLyrics) {
        return {
          syncedLyrics: getRes.data.syncedLyrics || null,
          plainLyrics: getRes.data.plainLyrics || null
        };
      }
    } catch {
      // Continue to search
    }

    // 2. Try LRCLIB search
    try {
      const searchRes = await lrclibClient.get('https://lrclib.net/api/search', {
        params: {
          q: `${cleanTitle} ${cleanArtist}`.trim()
        }
      });
      const items = searchRes.data;
      if (Array.isArray(items) && items.length > 0) {
        const best = items.find((i: any) => i.syncedLyrics) || items[0];
        return {
          syncedLyrics: best.syncedLyrics || null,
          plainLyrics: best.plainLyrics || null
        };
      }
    } catch {
      // Continue to lyrics.ovh fallback
    }

    // 3. Fallback to lyrics.ovh
    try {
      const ovhRes = await axios.get(`https://api.lyrics.ovh/v1/${encodeURIComponent(cleanArtist)}/${encodeURIComponent(cleanTitle)}`, {
        timeout: 4000
      });
      if (ovhRes.data?.lyrics) {
        return {
          syncedLyrics: null,
          plainLyrics: ovhRes.data.lyrics
        };
      }
    } catch {
      // No lyrics found
    }

    return { syncedLyrics: null, plainLyrics: null };
  }
};
