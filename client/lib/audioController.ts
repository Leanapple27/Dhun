import { usePlayerStore } from '../stores/playerStore';

class AudioController {
  private player: any = null;
  private isReady = false;
  private pendingVideoId: string | null = null;
  private prebufferedTrackId: string | null = null;
  private updateTimer: any = null;

  init() {
    if (typeof window === 'undefined') return;

    if ((window as any).YT && (window as any).YT.Player) {
      this.createPlayer();
      return;
    }

    if (!document.getElementById('yt-iframe-api')) {
      const tag = document.createElement('script');
      tag.id = 'yt-iframe-api';
      tag.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(tag);
    }

    const prevCallback = (window as any).onYouTubeIframeAPIReady;
    (window as any).onYouTubeIframeAPIReady = () => {
      if (prevCallback) prevCallback();
      this.createPlayer();
    };
  }

  createPlayer() {
    if (this.player || typeof window === 'undefined') return;
    if (!(window as any).YT || !(window as any).YT.Player) {
      return; // Will be called automatically by onYouTubeIframeAPIReady
    }

    const container = document.getElementById('dhun-yt-player');
    if (!container) return;

    try {
      this.player = new (window as any).YT.Player('dhun-yt-player', {
        height: '100%',
        width: '100%',
        host: 'https://www.youtube-nocookie.com',
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          enablejsapi: 1,
          fs: 0,
          iv_load_policy: 3,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
          origin: window.location.origin
        },
        events: {
          onReady: () => {
            this.isReady = true;
            const { volume, isMuted } = usePlayerStore.getState();
            if (this.player?.setVolume) {
              this.player.setVolume(Math.round(volume * 100));
              if (isMuted) this.player.mute();
            }

            if (this.pendingVideoId) {
              const id = this.pendingVideoId;
              this.pendingVideoId = null;
              this.loadAndPlay(id);
            }
          },
          onStateChange: (event: any) => {
            this.handleStateChange(event.data);
          },
          onError: (event: any) => {
            console.warn('YouTube Player Error:', event.data);
            usePlayerStore.setState({ isLoading: false });
            // Do not aggressively skip on Error 150; keep state stable
            if (event.data !== 150 && event.data !== 101) {
              usePlayerStore.getState().next();
            }
          }
        }
      });
    } catch (err) {
      console.error('Failed to create YouTube player:', err);
    }
  }

  private handleStateChange(state: number) {
    const store = usePlayerStore.getState();

    // 1 = PLAYING
    if (state === 1) {
      const dur = this.player?.getDuration?.() || store.currentTrack?.duration || 0;
      usePlayerStore.setState({
        isPlaying: true,
        isLoading: false,
        duration: dur
      });
      this.startProgressTracking();
      this.updateMediaSession();
    } 
    // 2 = PAUSED
    else if (state === 2) {
      usePlayerStore.setState({ isPlaying: false });
      this.stopProgressTracking();
    } 
    // 0 = ENDED
    else if (state === 0) {
      this.stopProgressTracking();
      if (store.repeatMode === 'one') {
        this.seek(0);
        this.play();
      } else {
        store.next();
      }
    } 
    // 3 = BUFFERING
    else if (state === 3) {
      usePlayerStore.setState({ isLoading: true });
    }
  }

  private startProgressTracking() {
    this.stopProgressTracking();
    this.updateTimer = setInterval(() => {
      if (this.player && this.player.getCurrentTime) {
        try {
          const currentTime = this.player.getCurrentTime() || 0;
          const duration = this.player.getDuration() || usePlayerStore.getState().duration;
          usePlayerStore.setState({ currentTime, duration });

          // Pre-buffer next track assets at 85% progress
          if (duration > 0 && currentTime / duration >= 0.85) {
            this.prebufferNextTrack();
          }
        } catch {}
      }
    }, 250);
  }

  private prebufferNextTrack() {
    const { queue, queueIndex } = usePlayerStore.getState();
    const nextTrack = queue[queueIndex + 1];
    if (nextTrack && this.prebufferedTrackId !== nextTrack.id) {
      this.prebufferedTrackId = nextTrack.id;
      // Pre-warm browser image cache for next artwork
      if (typeof window !== 'undefined' && nextTrack.thumbnail) {
        const img = new Image();
        img.src = nextTrack.thumbnail;
      }
    }
  }

  private stopProgressTracking() {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
      this.updateTimer = null;
    }
  }

  private updateMediaSession() {
    if (typeof window !== 'undefined' && 'mediaSession' in navigator) {
      const track = usePlayerStore.getState().currentTrack;
      if (!track) return;

      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title,
        artist: track.artist,
        artwork: track.thumbnail
          ? [
              { src: track.thumbnail, sizes: '96x96', type: 'image/jpeg' },
              { src: track.thumbnail, sizes: '256x256', type: 'image/jpeg' },
              { src: track.thumbnail, sizes: '512x512', type: 'image/jpeg' }
            ]
          : []
      });

      navigator.mediaSession.setActionHandler('play', () => this.play());
      navigator.mediaSession.setActionHandler('pause', () => this.pause());
      navigator.mediaSession.setActionHandler('nexttrack', () => usePlayerStore.getState().next());
      navigator.mediaSession.setActionHandler('previoustrack', () => usePlayerStore.getState().previous());
    }
  }

  loadAndPlay(videoId: string) {
    if (!this.isReady || !this.player || !this.player.loadVideoById) {
      this.pendingVideoId = videoId;
      this.init();
      return;
    }

    try {
      this.player.loadVideoById({ videoId });
      this.player.playVideo();
    } catch (e) {
      console.error('loadAndPlay error:', e);
    }
  }

  play() {
    if (this.player && this.player.playVideo) {
      this.player.playVideo();
    }
  }

  pause() {
    if (this.player && this.player.pauseVideo) {
      this.player.pauseVideo();
    }
  }

  seek(time: number) {
    if (this.player && this.player.seekTo) {
      this.player.seekTo(time, true);
    }
  }

  setVolume(volume: number) {
    if (this.player && this.player.setVolume) {
      this.player.setVolume(Math.round(volume * 100));
    }
  }

  setMute(mute: boolean) {
    if (!this.player) return;
    if (mute && this.player.mute) {
      this.player.mute();
    } else if (!mute && this.player.unMute) {
      this.player.unMute();
    }
  }

  setPlaybackRate(rate: number) {
    if (this.player && this.player.setPlaybackRate) {
      this.player.setPlaybackRate(rate);
    }
  }
}

export const audioController = new AudioController();
