export interface Track {
  videoId: string;
  title: string;
  artist: string;
  album?: string;
  duration: number;
  thumbnail: string;
}

export interface Album {
  albumId: string;
  title: string;
  artist: string;
  year?: string;
  thumbnail: string;
  tracks?: Track[];
}

export interface Artist {
  artistId: string;
  name: string;
  thumbnail: string;
  description?: string;
}

export interface SearchResult {
  tracks: Track[];
  albums: Album[];
  artists: Artist[];
}

export interface PipedInstance {
  url: string;
  region: string;
  priority: number;
  active: boolean;
}

export interface PipedStreamResponse {
  audioStreams: {
    url: string;
    bitrate: number;
    mimeType: string;
  }[];
  title: string;
  uploader: string;
  thumbnailUrl: string;
  duration: number;
}

export interface PipedSearchResponse {
  items: any[];
  nextpage?: string;
}

export interface QueuedTrack extends Track {
  queueId: string;
}

export interface User {
  id: string;
  email: string;
}
