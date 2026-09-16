import { Innertube } from 'youtubei.js';

let innertubeInstance: Innertube | null = null;

async function getInnertube(): Promise<Innertube> {
  if (!innertubeInstance) {
    innertubeInstance = await Innertube.create();
  }
  return innertubeInstance;
}

export interface ExtractedPlaylist {
  name: string;
  thumbnailUrl?: string;
  relatedStreams: Array<{
    id: string;
    title: string;
    artist: string;
    thumbnail: string;
    duration: number;
    url: string;
  }>;
}

export async function fetchYouTubePlaylist(playlistId: string): Promise<ExtractedPlaylist> {
  const yt = await getInnertube();

  // Try YouTube Music playlist first
  try {
    const pl = await yt.music.getPlaylist(playlistId);
    const title = (pl.header as any)?.title?.text || (pl.header as any)?.title?.toString() || 'Imported YouTube Music Playlist';
    const thumbnail = (pl.header as any)?.thumbnails?.[0]?.url || '';

    const relatedStreams = (pl.contents || pl.items || []).map((item: any) => {
      const artist = item.authors?.map((a: any) => a.name).join(', ') || item.author?.name || 'Unknown Artist';
      const id = item.id;
      const title = item.title?.text || item.title?.toString() || item.title || 'Untitled';
      const thumb = item.thumbnail?.contents?.[0]?.url || (id ? `https://i.ytimg.com/vi/${id}/mqdefault.jpg` : '');
      const duration = item.duration?.seconds || 0;

      return {
        id,
        title,
        artist,
        thumbnail: thumb,
        duration,
        url: `/watch?v=${id}`
      };
    }).filter((t: any) => Boolean(t.id && t.title));

    if (relatedStreams.length > 0) {
      return {
        name: title,
        thumbnailUrl: thumbnail || relatedStreams[0]?.thumbnail,
        relatedStreams
      };
    }
  } catch (err: any) {
    console.warn(`[youtubeService] music.getPlaylist failed (${err?.message}), falling back to getPlaylist...`);
  }

  // Fallback to standard YouTube getPlaylist
  try {
    const pl = await yt.getPlaylist(playlistId);
    const title = pl.info?.title || 'Imported YouTube Playlist';
    const thumbnail = pl.info?.thumbnails?.[0]?.url || '';

    const relatedStreams = (pl.videos || []).map((v: any) => {
      const id = v.id || v.content_id;
      const title = v.title?.text || v.title?.toString() || 'Untitled';
      const artist = v.author?.name || 'YouTube Music';
      const thumb = v.thumbnails?.[0]?.url || (id ? `https://i.ytimg.com/vi/${id}/mqdefault.jpg` : '');
      const duration = v.duration?.seconds || 0;

      return {
        id,
        title,
        artist,
        thumbnail: thumb,
        duration,
        url: `/watch?v=${id}`
      };
    }).filter((t: any) => Boolean(t.id && t.title));

    return {
      name: title,
      thumbnailUrl: thumbnail || relatedStreams[0]?.thumbnail,
      relatedStreams
    };
  } catch (err: any) {
    console.error(`[youtubeService] getPlaylist failed:`, err?.message);
    throw new Error(`Failed to load playlist: ${err?.message || 'Unknown error'}`);
  }
}
